import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
import type { JSONSchema7 } from "json-schema";
import { ChatAL } from "live2d-copilot-shared/src/ChatAL";
import {
  ChatClientBase,
  ChatClientConfig,
  ChatClientSendOptions,
} from "./ChatClientBase";

export namespace ChatGPT {
  export enum MessageRole {
    System = "system",
    Assistant = "assistant",
    User = "user",
    Function = "function",
  }

  export enum FinishReason {
    Stop = "stop",
    Length = "length",
    ContentFilter = "content_filter",
    FunctionCall = "function_call",
  }

  export interface FunctionDefine {
    description: string;
    name: string;
    parameters: JSONSchema7;
  }

  export interface FunctionCall {
    name?: string;
    arguments?: any;
  }

  export interface ToolCall {
    index?: number;
    id?: number;
    type?: string;
    function?: FunctionCall;
  }

  export interface Message {
    role?: MessageRole;
    name?: string;
    content?: string;
    function_call?: FunctionCall;
    tool_calls?: ToolCall[];
  }

  export type ResponseMessage = Message;

  export type ResponseDelta = ResponseMessage;

  export interface RequestData {
    model?: string;
    stream?: boolean;
    messages: Message[];
    stop?: null;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" };

    tools?: FunctionDefine[];
    tool_choice?: "auto" | "none";

    functions?: FunctionDefine[];
    function_call?: "auto" | "none";
  }

  export interface Choice {
    message?: ResponseMessage;
    index: number;
    finish_reason: FinishReason | null;
    finish_details?: any;
  }

  export interface StreamChoice {
    delta?: ResponseDelta;
    index: number;
    finish_reason: FinishReason | null;
    finish_details?: any;
  }

  export interface Usage {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }

  export interface ResponseData {
    error?: {
      code: string;
      message: string;
    };
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Choice[];
    usage: Usage;
    prompt_filter_results?: any;
  }

  export interface StreamResponseData {
    error?: {
      code: string;
      message: string;
    };
    id: string;
    object: string;
    created: number;
    model: string;
    choices?: StreamChoice[];
    usage: null;
    prompt_filter_results?: any;
  }
}

export interface ChatGPTClientConfig extends ChatClientConfig {
  url: string;
  headers: Record<string, string> | undefined;
  requestData: Partial<ChatGPT.RequestData>;
}

class RetriableError extends Error {}
class FatalError extends Error {}

export class ChatGPTClient extends ChatClientBase<ChatGPTClientConfig> {
  private controller?: AbortController;

  send(options: ChatClientSendOptions) {
    if (!this.config) {
      throw new Error("ChatGPTClient config not set");
    }

    const tool_calls: ChatAL.ToolCall[] = [];

    const controller = new AbortController();
    const signal = controller.signal;
    this.controller = controller;

    const promise = fetchEventSource(this.config.url, {
      signal,
      openWhenHidden: true,
      method: "POST",
      headers: this.config.headers,
      body: JSON.stringify({
        ...this.config.requestData,
        stream: true,
        messages: options.messages,
      }),
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get("content-type")?.includes(EventStreamContentType)
        ) {
          options.onOpen?.();
          return; // everything's good
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          // client-side errors are usually non-retriable:
          throw new FatalError();
        } else {
          throw new RetriableError();
        }
      },
      onclose() {
        // if the server closes the connection unexpectedly, retry:
        // throw new RetriableError();
      },
      onerror(err) {
        if (err instanceof FatalError) throw err;
        if (err instanceof RetriableError) return;
        if (err?.message == "Failed to fetch")
          throw new FatalError(err.message);
        throw err;
      },
      onmessage(msg) {
        // if the server emits an error message, throw an exception
        // so it gets handled by the onerror callback below:
        if (msg.event === "FatalError") {
          throw new FatalError(msg.data);
        }

        if (msg.data === "[DONE]") {
          options.onDone?.();
          return;
        }

        let data: ChatGPT.StreamResponseData;
        try {
          data = JSON.parse(msg.data);
        } catch (error: any) {
          throw new FatalError(error?.message);
        }

        if (data?.error) {
          throw new FatalError(data.error.message);
        }

        if (data?.choices?.[0]) {
          let finish_reason = data.choices[0].finish_reason;
          if (finish_reason) {
            options.onFinishReason?.(intoFinalResponse(finish_reason));
          }

          let delta = data.choices[0].delta;
          if (delta?.content) {
            options.onDeltaContent?.(delta.content);
          }

          if (delta?.tool_calls) {
            options.onDeltaToolCalls?.(delta.tool_calls);

            if (delta.tool_calls[0]) {
              let delta_tool_call = delta.tool_calls[0];
              let index = delta_tool_call.index!;
              if (!tool_calls[index]) {
                tool_calls[index] = {
                  index,
                  function: { name: "", arguments: "" },
                  ...delta_tool_call,
                };
              }
              if (delta_tool_call.id) {
                tool_calls[index]["id"] = delta_tool_call.id;
              }
              if (delta_tool_call.function?.name) {
                tool_calls[index]["function"]!["name"] =
                  delta_tool_call.function.name;
              }
              if (delta_tool_call.function?.arguments) {
                tool_calls[index]["function"]!["arguments"] +=
                  delta_tool_call.function.arguments;
              }
            }
          }
        }
      },
    })
      .catch((error: any) => {
        options.onError?.(error);
      })
      .finally(() => {
        options.onFinally?.();
      });

    return {
      tool_calls,
      promise,
    };
  }

  abort() {
    this.controller?.abort();
  }
}

function intoFinalResponse(
  data: ChatGPT.FinishReason | null
): ChatAL.FinishReason {
  switch (data) {
    case null:
      return ChatAL.FinishReason.Stop;
    case ChatGPT.FinishReason.ContentFilter:
      return ChatAL.FinishReason.ContentFilter;
    case ChatGPT.FinishReason.Length:
      return ChatAL.FinishReason.Length;
    case ChatGPT.FinishReason.FunctionCall:
      return ChatAL.FinishReason.Unknown;
    case ChatGPT.FinishReason.Stop:
      return ChatAL.FinishReason.Unknown;
  }
}

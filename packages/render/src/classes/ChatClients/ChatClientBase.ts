import { ChatAL } from "live2d-copilot-shared/src/ChatAL";

export interface ChatClientSendOptions {
  messages: ChatAL.Message[];
  onOpen?(): void;
  onFinishReason?(finish_reason: ChatAL.FinishReason): void;
  onDeltaContent?(delta_content: string): void;
  onDeltaToolCalls?(delta_tool_calls: ChatAL.ToolCall[]): void;
  onDone?(): void;
  onError?(error: Error): void;
  onFinally?(): void;
}

export interface ChatClientConfig {}

export abstract class ChatClientBase<T extends ChatClientConfig = any> {
  constructor(options: { config?: T }) {
    this.config = options.config;
  }
  config?: T;
  abstract send(options: ChatClientSendOptions): {
    promise: Promise<void>;
    tool_calls: ChatAL.ToolCall[];
  };
  abstract abort(): void;
}

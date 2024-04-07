import { Chat, ChatAL, CommonEndpoint, Tool } from "@ai-zen/chats-core";
import { shallowRef } from "vue";

export function useChat(options: {
  onRun?(): void;
  onOpen?(): void;
  onDeltaContent?(deltaContent: string): void;
  onParsed?(receiver: ChatAL.Message): void;
  getDefaultMessages(): ChatAL.Message[];
  getDefaultTools(): Tool[];
}) {
  let chatInstanceRef = shallowRef<Chat>();

  function init() {
    abort();

    chatInstanceRef.value?.events.destroy();

    chatInstanceRef.value = new Chat({
      messages: options.getDefaultMessages(),
      tools: options.getDefaultTools(),
      model_key: "GPT35Turbo_0631",
      endpoints: [
        new CommonEndpoint({
          enabled_models_keys: ["GPT35Turbo_0631"],
          url: "https://api.ai-zen.cn/llm/chat/gpt-35-turbo-001",
          headers: {
            "Content-Type": "application/json",
          },
          body: {},
        }),
      ],
    });

    chatInstanceRef.value?.events.on("run", onRun);
    chatInstanceRef.value?.events.on("open", onOpen);
    chatInstanceRef.value?.events.on("chunk", onChunk);
    chatInstanceRef.value?.events.on("parsed", onParsed);
  }

  function onRun() {
    options.onRun?.();
  }

  function onOpen() {
    options.onOpen?.();
  }

  /**
   * 响应流式数据片段
   */
  function onChunk(chunk: ChatAL.StreamResponseData) {
    if (chunk?.choices?.[0]?.delta?.content) {
      options.onDeltaContent?.(chunk.choices[0].delta.content as string);
    }
  }

  /**
   * 响应一轮对话的流式数据解析完毕（通常在请求完成之后）
   */
  function onParsed(receiver: ChatAL.Message) {
    options.onParsed?.(receiver);
  }

  /**
   * 修剪消息列表
   */
  function trimMessages() {
    if (!chatInstanceRef.value) return;

    const systemMessages = chatInstanceRef.value.messages.filter(
      (x) => x.role == ChatAL.Role.System
    );
    const otherMessages = chatInstanceRef.value.messages.filter(
      (x) => x.role != ChatAL.Role.System
    );
    chatInstanceRef.value.messages = [
      ...systemMessages,
      ...otherMessages.slice(-10),
    ];
  }

  /**
   * 发送新消息
   */
  function send(newMessage: string) {
    if (!chatInstanceRef.value) return;
    trimMessages();
    chatInstanceRef.value.send(newMessage);
  }

  /**
   * 中止上一次发送
   */
  function abort() {
    chatInstanceRef.value?.abort();
  }

  /**
   * 设置消息列表
   */
  function setMessages(messages: ChatAL.Message[]) {
    if (!chatInstanceRef.value) return;
    chatInstanceRef.value.messages = messages;
  }

  return {
    chatInstanceRef,
    init,
    send,
    abort,
    setMessages,
  };
}

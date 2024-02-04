import { ChatAL } from "live2d-copilot-shared/src/ChatAL";
import { computed, reactive, shallowReactive, watch } from "vue";
import * as ChatClients from "../../../classes/ChatClients";
import { ChatClientBase } from "../../../classes/ChatClients/ChatClientBase";
import { settingManager } from "../../../modules/setting";

export function useChat(options: {
  onDeltaContent(delta_content: string): void;
  onFinally(): void;
}) {
  const chatState = reactive({
    messages: [] as ChatAL.Message[],
  });

  const chatClientState = shallowReactive({
    name: null as string | null,
    client: null as ChatClientBase | null,
  });

  function init() {
    chatState.messages = [];
  }

  function abort() {
    chatClientState.client?.abort();
  }

  function createSystemMessage(content = "") {
    return reactive({
      role: ChatAL.Role.System,
      content,
      status: ChatAL.MessageStatus.Completed,
    });
  }

  function createAssistantMessage(content = "") {
    return reactive({
      role: ChatAL.Role.Assistant,
      content,
      status: ChatAL.MessageStatus.Pending,
    });
  }

  function createUserMessage(content = "") {
    return reactive({
      role: ChatAL.Role.User,
      content,
      status: ChatAL.MessageStatus.Completed,
    });
  }

  async function sendNewMessage(newMessage: string) {
    const userMessage = createUserMessage(newMessage);
    const assistantMessage = createAssistantMessage();
    chatState.messages.push(userMessage, assistantMessage);
    await send(assistantMessage);
  }

  async function send(pendingMsg?: ChatAL.Message) {
    if (!chatClientState.client) return;

    const messages: ChatAL.Message[] = chatState.messages
      .filter((message) => message.status == ChatAL.MessageStatus.Completed)
      .map((message) => ({
        role: message.role,
        content: message.content,
        tool_calls: message.tool_calls?.length ? message.tool_calls : undefined,
      }));

    const { tool_calls } = chatClientState.client.send({
      messages,
      onOpen() {
        pendingMsg!.status = ChatAL.MessageStatus.Writing;
      },
      onDeltaContent(delta_content) {
        pendingMsg!.content += delta_content;
        options.onDeltaContent(delta_content);
      },
      onFinishReason(finish_reason) {
        pendingMsg!.finish_reason = finish_reason;
      },
      onError(error) {
        pendingMsg!.status = ChatAL.MessageStatus.Failed;
        pendingMsg!.content = error.message;
      },
      onDone() {
        pendingMsg!.status = ChatAL.MessageStatus.Completed;
      },
      onFinally() {
        options.onFinally();
      },
    });

    if (tool_calls?.length) {
      pendingMsg!.tool_calls = tool_calls;
    }

    // wait the request to completed.
    // await promise;

    // if (pendingMsg!.tool_calls?.length) {
    //   const results = await handleToolCalls(pendingMsg!.tool_calls!);
    //   const toolCallsMessage = createToolCallsMessage(results);
    //   const assistantMessage = createAssistantMessage();
    //   chatState.messages.push(toolCallsMessage, assistantMessage);
    //   await send(assistantMessage);
    // }
  }

  const isHasPendingMessage = computed(() =>
    chatState.messages.some(
      (msg) => msg.status === ChatAL.MessageStatus.Pending
    )
  );

  watch(
    () => settingManager.state.data,
    (newSetting) => {
      if (!newSetting) return;

      const name = newSetting.currentChatClient;
      let config = newSetting.chatClientConfigs?.[name] as any;

      if (name == "AIZen") {
        config ??= {
          url: "https://api.ai-zen.cn/llm/chat/gpt-35-turbo-001",
          headers: { "Content-Type": "application/json" },
        };
      }

      const isChanged =
        JSON.stringify({
          name: chatClientState.name,
          config: chatClientState.client?.config,
        }) !== JSON.stringify({ name, config });

      if (isChanged) {
        chatClientState.name = name;
        chatClientState.client = new ChatClients[name]({ config });
      }
    },
    { immediate: true }
  );

  return {
    init,
    abort,
    createSystemMessage,
    createAssistantMessage,
    createUserMessage,
    chatState,
    chatClientState,
    sendNewMessage,
    isHasPendingMessage,
  };
}

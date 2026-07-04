import { Agent, AgentNS, ChatGPT, OpenAI } from "@ai-zen/agents-core";
import { ref } from "vue";

const ENDPOINTS = {
  deepseek: "https://api.deepseek.com/v1",
  chatglm: "https://open.bigmodel.cn/api/paas/v4",
} as const;

export const PRESET_MODELS = {
  deepseek: [
    { id: "deepseek-v4-pro", name: "DeepSeek-V4-Pro", modelName: "deepseek-v4-pro" },
    { id: "deepseek-v4-flash", name: "DeepSeek-V4-Flash", modelName: "deepseek-v4-flash" },
  ],
  chatglm: [
    { id: "glm-5.2", name: "GLM-5.2", modelName: "glm-5.2" },
    { id: "glm-5.1", name: "GLM-5.1", modelName: "glm-5.1" },
    { id: "glm-4.7", name: "GLM-4.7", modelName: "glm-4.7" },
    { id: "glm-4.7-flash", name: "GLM-4.7-Flash（免费）", modelName: "glm-4.7-flash" },
  ],
} as const;

export type Provider = keyof typeof ENDPOINTS;

export function useChat(options: {
  onDelta?: (delta: string) => void;
  onParsed?: () => void;
}) {
  let agent: Agent | null = null;
  const isRunning = ref(false);

  async function init(provider: Provider, apiKey: string, modelName: string) {
    const endpoint = new OpenAI({
      openai_endpoint: ENDPOINTS[provider],
      api_key: apiKey,
    });
    const model = new ChatGPT({
      model_config: {},
      request_config: await endpoint.chatCompletion(modelName),
    });
    agent = new Agent({ model });
    agent.messages.push({
      role: AgentNS.Role.System,
      content: "你是虹色Mao，一个AI桌宠助手。回答要简洁，用中文，每次只回一句话。",
    });

    agent.events.on("chunk", (chunk: AgentNS.StreamResponseData) => {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) options.onDelta?.(delta as string);
    });
    agent.events.on("parsed", () => {
      isRunning.value = false;
      options.onParsed?.();
    });
  }

  async function send(content: string) {
    if (!agent || isRunning.value) return;
    isRunning.value = true;
    try {
      await agent.send(content);
    } catch {
      isRunning.value = false;
    }
  }

  return { init, send, isRunning };
}

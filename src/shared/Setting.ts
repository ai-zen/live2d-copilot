export interface AppSettings {
  llm_api_key: string;
  llm_provider: "deepseek" | "chatglm";
  llm_model: string;
  tts_voice: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  llm_api_key: "",
  llm_provider: "deepseek",
  llm_model: "",
  tts_voice: "zh-CN-XiaoyiNeural",
};

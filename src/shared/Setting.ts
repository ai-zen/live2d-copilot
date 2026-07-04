// ============================================================
// Settings
// ============================================================

export interface AppSettings {
  /** 界面语言 */
  lang: "zh-CN" | "en";
  /** 桌宠窗口置顶 */
  alwaysOnTop: boolean;
  /** 显示聊天输入框 */
  isShowChat: boolean;
  /** 语音识别开关 */
  isVoiceRecognition: boolean;
  /** TTS 音量 0-1 */
  ttsVolume: number;
  /** TTS 语速 0.5-2 */
  ttsRate: number;
  /** AI 模型选择 */
  aiModel: string;
  /** AI 端点 URL */
  aiEndpoint: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  lang: "zh-CN",
  alwaysOnTop: true,
  isShowChat: false,
  isVoiceRecognition: false,
  ttsVolume: 1.0,
  ttsRate: 1.0,
  aiModel: "GPT35Turbo_0631",
  aiEndpoint: "https://api.ai-zen.cn/llm/chat/gpt-35-turbo-001",
};

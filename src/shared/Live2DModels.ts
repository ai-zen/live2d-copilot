// ============================================================
// Live2D Models
// ============================================================

export interface Live2DModelProfile {
  version: 1;
  /** .model3.json 文件名 */
  model3: string;
  /** 预览图 */
  preview: string;
  /** 模型标题 */
  title: string;
  /** 模型描述 */
  description: string;
  /** 皮肤映射 */
  skins?: {
    name: string;
    mapping: Record<string, string>;
  }[];
  /** 聊天系统 prompt（可被用户覆盖） */
  chat?: {
    prompt?: string;
  };
  /** TTS 语音选择 */
  tts?: {
    voiceName?: string;
    lang?: string;
    rate?: number;
    pitch?: number;
  };
  /** 模型变换（拖拽/缩放后保存） */
  modelTransform?: TransformState;
  /** 字幕位置 */
  subtitlesTransform?: TransformState;
  /** 聊天输入框位置 */
  chatInputTransform?: TransformState;
}

export interface Live2DModelPathInfo {
  modelName: string;
  modelDir: string;
  modelFileName: string;
  modelPath: string;
}

/** UI 元素可拖拽变换状态 */
export interface TransformState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

/** 模型在屏幕上的实时位置信息 */
export interface Live2DModelPosition {
  relativeScale: number;
  deviceX: number;
  deviceY: number;
  centerDeviceX: number;
  centerDeviceY: number;
  scaleX: number;
  scaleY: number;
  viewX: number;
  viewY: number;
  screenX: number;
  screenY: number;
}

export interface Live2DModelManagerConfig {
  current: string; // Path to the current Live2D model
}

export interface Live2DModelPathInfo {
  modelName: string; // Name of the Live2D model
  modelDir: string; // Directory of the Live2D model
  modelFileName: string; // File name of the Live2D model
  modelPath: string; // Full path to the Live2D model
}

export interface Live2DModelProfileV1 {
  version: 1;
  model3: string; // File name of the Live2D model profile in .model3.json format
  preview: string; // preview Image
  title: string;
  description: string;
  skins?: {
    name: string; // Name of the skin
    mapping: Record<string, string>; // Mapping of skin components
  }[];
  chat?: {
    prompt?: string;
  };
  tts?: {
    type: string;
    azure: {
      name: string; // Name of the voice
    };
  };
  modelTransform?: ModelTransform;
  subtitlesTransform?: SubtitlesTransform;
  chatInputTransform?: ChatInputTransform;
}

export interface Live2DModelProfileEx extends Live2DModelProfileV1 {
  _modelDir: string; // Directory of the Live2D model
  _modelFileName: string; // File name of the Live2D model profile in .model3.json format
  _modelName: string; // Name of the Live2D model
  _modelPath: string; // Full path to the Live2D model
}

export interface MoveableTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export class SubtitlesTransform implements MoveableTransform {
  offsetX = 0;
  offsetY = 100;
  scale = 1;
}

export class ChatInputTransform implements MoveableTransform {
  offsetX = 0;
  offsetY = 200;
  scale = 1;
}

export class ModelTransform implements MoveableTransform {
  offsetX = 0;
  offsetY = 0;
  scale = 1;
}

export interface Live2DModelPosition {
  /** Scale from (user adjusted size) / (model default size). */
  relativeScale: number;
  /** The position of the model relative to the viewport */
  deviceX: number;
  /** The position of the model relative to the viewport */
  deviceY: number;
  /** The position of the model relative to the viewport center */
  centerDeviceX: number;
  /** The position of the model relative to the viewport center */
  centerDeviceY: number;
  scaleX: number; // Live2D Model inner info
  scaleY: number; // Live2D Model inner info
  viewX: number; // Live2D Model inner info
  viewY: number; // Live2D Model inner info
  screenX: number; // Live2D Model inner info
  screenY: number; // Live2D Model inner info
}

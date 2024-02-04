export interface Live2DModelManagerConfig {
  current: string; // Path to the current Live2D model
}

export interface Live2DModelPathInfo {
  modelName: string; // Name of the Live2D model
  modelDir: string; // Directory of the Live2D model
  modelFileName: string; // File name of the Live2D model
  modelPath: string; // Full path to the Live2D model
}

export interface Live2DModelProfile {
  Version: 1;
  Model3: string; // File name of the Live2D model profile in .model3.json format
  Preview: string; // Preview Image
  Title: string;
  Description: string;
  Skins?: {
    Name: string; // Name of the skin
    Mapping: Record<string, string>; // Mapping of skin components
  }[];
  Chat?: {
    Prompt?: string;
  };
  ModelTransform?: ModelTransform;
  SubtitlesTransform?: SubtitlesTransform;
  ChatInputTransform?: ChatInputTransform;
}

export interface Live2DModelProfileEx extends Live2DModelProfile {
  _ModelDir: string; // Directory of the Live2D model
  _ModelFileName: string; // File name of the Live2D model profile in .model3.json format
  _ModelName: string; // Name of the Live2D model
  _ModelPath: string; // Full path to the Live2D model
}

export interface MoveableTransform {
  OffsetX: number;
  OffsetY: number;
  Scale: number;
}

export class SubtitlesTransform implements MoveableTransform {
  OffsetX = 0;
  OffsetY = 100;
  Scale = 1;
}

export class ChatInputTransform implements MoveableTransform {
  OffsetX = 0;
  OffsetY = 200;
  Scale = 1;
}

export class ModelTransform implements MoveableTransform {
  OffsetX = 0;
  OffsetY = 0;
  Scale = 1;
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

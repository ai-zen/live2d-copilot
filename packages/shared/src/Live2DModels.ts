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
  Skins: {
    Name: string; // Name of the skin
    Mapping: Record<string, string>; // Mapping of skin components
  }[];
}

export interface Live2DModelProfileEx extends Live2DModelProfile {
  _ModelDir: string; // Directory of the Live2D model
  _ModelFileName: string; // File name of the Live2D model profile in .model3.json format
  _ModelName: string; // Name of the Live2D model
  _ModelPath: string; // Full path to the Live2D model
}

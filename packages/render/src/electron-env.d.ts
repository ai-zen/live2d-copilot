import type { ElectronAPI } from "live2d-copilot-main/src/preload";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

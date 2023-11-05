import { Menu } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { createBrowserWindowEx } from "./createBrowserWindowEx";
import { live2DModelManager } from "../modules/Live2DModelsManager";

export const MODELS_ROUTE_PATH = `/models-window`;

/**
 * Create models window
 * @param staticServeOrigin
 */
export async function createModelsWindow(staticServeOrigin: string) {
  // Create window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${MODELS_ROUTE_PATH}`,
    {
      name: "models-window",
      width: 1430,
      height: 1014,
      minWidth: 800,
      minHeight: 568,
    }
  );

  if (!win) return;

  Menu.setApplicationMenu(null);

  // Preload of the window.
  preload(win);

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  const methods = win.rpc.register(win.name, {
    loadProfiles() {
      return live2DModelManager.loadProfiles();
    },

    getCurrentProfile() {
      return live2DModelManager.getCurrentProfile();
    },

    setCurrent(model3: string) {
      return live2DModelManager.setCurrent(model3);
    },
  });

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

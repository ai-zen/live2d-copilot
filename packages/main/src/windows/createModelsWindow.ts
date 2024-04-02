import { Menu } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { live2DModelManager } from "../modules/live2DModelsManager";
import { staticServeManager } from "../modules/staticServeManager";
import { preload as preloadOfSetting } from "./preloads/setting";
import { preload as preloadOfSteamworks } from "./preloads/steamworks";

export const MODELS_ROUTE_PATH = `/models-window`;

/**
 * Create models window
 */
export async function createModelsWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${MODELS_ROUTE_PATH}`,
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

  // Preload of setting.
  preloadOfSetting(win);

  // Preload of steamworks.
  preloadOfSteamworks(win);

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  return win.rpc.register(win.name, {
    loadProfile: live2DModelManager.loadProfile.bind(live2DModelManager),
    loadProfiles: live2DModelManager.loadProfiles.bind(live2DModelManager),
    getCurrentProfile:
      live2DModelManager.getCurrentProfile.bind(live2DModelManager),
    setCurrent: live2DModelManager.setCurrent.bind(live2DModelManager),
    buildProfile: live2DModelManager.buildProfile.bind(live2DModelManager),
  });
}

export type Methods = ReturnType<typeof preload>;

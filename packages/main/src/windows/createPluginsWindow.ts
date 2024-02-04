import { SettingMethodsMainAPI } from "live2d-copilot-shared/src/Setting";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { settingManager } from "../modules/settingManager";
import { staticServeManager } from "../modules/staticServeManager";

export const PLUGINS_ROUTE_PATH = `/plugins-window`;

/**
 * Create plugins window
 */
export async function createPluginsWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${PLUGINS_ROUTE_PATH}`,
    { name: "plugins-window" }
  );

  if (!win) return;

  // Preload of the window.
  preload(win);

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  win.rpc.register<SettingMethodsMainAPI>("setting", {
    getSetting: settingManager.getSetting.bind(settingManager),
    setSetting: settingManager.setSetting.bind(settingManager),
  });

  const methods = win.rpc.register(win.name, {});

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

import { SettingMethodsMainAPI } from "live2d-copilot-shared/src/Setting";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { settingManager } from "../modules/settingManager";
import { staticServeManager } from "../modules/staticServeManager";
import { Menu } from "electron";

export const SETTING_ROUTE_PATH = `/setting-window`;

/**
 * Create setting window
 */
export async function createSettingWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${SETTING_ROUTE_PATH}`,
    { name: "setting-window" }
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

import { Menu } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { staticServeManager } from "../modules/staticServeManager";
import { preload as preloadOfSetting } from "./preloads/setting";

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

  // Preload of setting.
  preloadOfSetting(win);

  return win;
}

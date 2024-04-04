import { Menu } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { staticServeManager } from "../modules/staticServeManager";
import { preload as preloadOfSetting } from "./preloads/setting";
import { preload as preloadOfSteamworks } from "./preloads/steamworks";

export const PLUGINS_ROUTE_PATH = `/plugins-window`;

/**
 * Create plugins window
 */
export async function createPluginsWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${PLUGINS_ROUTE_PATH}`,
    {
      name: "plugins-window",
      width: 1430,
      height: 1014,
      minWidth: 800,
      minHeight: 568,
    }
  );

  if (!win) return;

  Menu.setApplicationMenu(null);

  // Preload of setting.
  preloadOfSetting(win);

  // Preload of steamworks.
  preloadOfSteamworks(win);

  return win;
}

import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const SETTING_ROUTE_PATH = `/setting-window`;

/**
 * Create setting window
 * @param staticServeOrigin
 */
export async function createSettingWindow(staticServeOrigin: string) {
  // Create window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${SETTING_ROUTE_PATH}`,
    { name: "setting-window" }
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
  const methods = win.rpc.register(win.name, {});

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

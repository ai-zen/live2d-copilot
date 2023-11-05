import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const PLUGINS_ROUTE_PATH = `/plugins-window`;

/**
 * Create plugins window
 * @param staticServeOrigin
 */
export async function createPluginsWindow(staticServeOrigin: string) {
  // Create window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${PLUGINS_ROUTE_PATH}`,
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
  const methods = win.rpc.register(win.name, {});

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

import { BrowserWindowEx } from "../classes/BrowserWindowEx";
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
  const methods = win.rpc.register(win.name, {});

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { staticServeManager } from "../modules/staticServeManager";

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

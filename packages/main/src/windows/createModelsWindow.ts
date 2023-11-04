import { app } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const MODELS_ROUTE_PATH = `/models-window`;

/**
 * Create models window
 * @param staticServeOrigin
 */
export async function createModelsWindow(staticServeOrigin: string) {
  // Create window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${MODELS_ROUTE_PATH}`,
    { name: "models-window" }
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

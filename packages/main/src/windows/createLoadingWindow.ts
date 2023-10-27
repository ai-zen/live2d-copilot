import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const LOADING_ROUTE_PATH = `/loading.html`;

/**
 * Create Loading window
 * @param staticServeOrigin
 */
export async function createLoadingWindow(staticServeOrigin: string) {
  // Create render window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${LOADING_ROUTE_PATH}`,
    {
      show: false,
      name: "loading-window",
      width: 1170,
      height: 720,
      minWidth: 884,
      minHeight: 600,
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
      alwaysOnTop: true,
    }
  );

  if (!win) return;

  // Once the window is ready after creation
  win.once("ready-to-show", () => {
    win.show();
    win.focus();
  });

  return win;
}

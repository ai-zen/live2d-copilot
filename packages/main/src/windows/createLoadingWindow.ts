import path from "node:path";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";

/**
 * Create Loading window
 */
export async function createLoadingWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `file:///${path.resolve(__dirname, "loading.html")}`,
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

  win.setIgnoreMouseEvents(true);

  // Once the window is ready after creation
  win.once("ready-to-show", () => {
    win.show();
  });

  return win;
}

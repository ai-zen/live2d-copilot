import * as path from "node:path";
import {
  BrowserWindowEx,
  BrowserWindowExConstructorOptions,
} from "../class/BrowserWindowEx";

/**
 * Create a rendering window
 */
export function createBrowserWindowEx(
  url: string,
  options: BrowserWindowExConstructorOptions,
  /**
   * Whether to allow window duplication
   */
  allowDuplicates = false
) {
  // Prevent window duplication
  if (!allowDuplicates && BrowserWindowEx.instanceMap.has(url)) {
    const lastWin = BrowserWindowEx.instanceMap.get(url)!;
    lastWin.show();
    return false;
  }

  const win = new BrowserWindowEx({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    ...options,
  });

  // Mark the window as open immediately
  BrowserWindowEx.instanceMap.set(url, win);

  win.loadURL(url);

  if (
    process.env.BUILD_MODE == "development" ||
    process.env.BUILD_MODE == "prerelease"
  ) {
    win.webContents.openDevTools({ mode: "undocked" });
  }

  win.on("close", () => {
    // Mark the window as closed
    BrowserWindowEx.instanceMap.delete(url);
  });

  return win;
}

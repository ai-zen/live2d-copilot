import { app } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { live2DModelManager } from "../modules/Live2DModelsManager";
import { useIgnoreMouseEventsByAlpha } from "./composables/useIgnoreMouseEventsByAlpha";
import { useSystemMouseMoveEvent } from "./composables/useSystemMouseMoveEvent";
import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const DESKTOP_PET_ROUTE_PATH = `/desktop-pet-window`;

/**
 * Create desktop pet window
 * @param staticServeOrigin
 */
export async function createDesktopPetWindow(staticServeOrigin: string) {
  // Create render window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${DESKTOP_PET_ROUTE_PATH}`,
    {
      show: false,
      name: "desktop-pet-window",
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
      fullscreen: true,
      movable: false,
    }
  );

  if (!win) return;

  // Preload of the window.
  preload(win);

  // Once the window is ready after creation.
  win.once("ready-to-show", () => {
    win.show();
    win.focus();
  });

  // Auto set IgnoreMouseEvents by alpha.
  useIgnoreMouseEventsByAlpha(win);

  // Sending system level mouse movement events to web contents
  useSystemMouseMoveEvent(win);

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  const callRecord = win.rpc.register(win.name, {
    /**
     * Close the loading window.
     */
    closeLoadingWindow() {
      BrowserWindowEx.getWin({
        name: "loading-window",
      })?.close();
    },

    /**
     * Get current Live2D model.
     */
    getCurrentLive2DModel() {
      return live2DModelManager.getCurrent();
    },

    /**
     * Quit app.
     */
    quit() {
      app.quit();
    },
  });

  return {
    callRecord,
  };
}

export type CallRecord = ReturnType<typeof preload>["callRecord"];

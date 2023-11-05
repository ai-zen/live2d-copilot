import { app } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { live2DModelManager } from "../modules/Live2DModelsManager";
import { useIgnoreMouseEventsByAlpha } from "./composables/useIgnoreMouseEventsByAlpha";
import { useSystemMouseMoveEvent } from "./composables/useSystemMouseMoveEvent";
import { createBrowserWindowEx } from "./createBrowserWindowEx";
import { createSettingWindow } from "./createSettingWindow";
import { createModelsWindow } from "./createModelsWindow";
import { createPluginsWindow } from "./createPluginsWindow";

export const DESKTOP_PET_ROUTE_PATH = `/desktop-pet-window`;

/**
 * Create desktop pet window
 * @param staticServeOrigin
 */
export async function createDesktopPetWindow(staticServeOrigin: string) {
  // Create window.
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
  preload(win, staticServeOrigin);

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
function preload(win: BrowserWindowEx, staticServeOrigin: string) {
  const webApi = win.rpc.use(win.name);

  /**
   * Forward the current model change event to a webpage
   */
  function onCurrentModelChange(...args: any[]) {
    webApi.onCurrentModelChange(args);
  }

  // Bind event listeners.
  live2DModelManager.eventBus.on("current model change", onCurrentModelChange);

  // Unbind event listeners.
  win.on("close", () => {
    live2DModelManager.eventBus.off(
      "current model change",
      onCurrentModelChange
    );
  });

  /**
   * Registering methods for webpage calls
   */
  const methods = win.rpc.register(win.name, {
    /**
     * Close the loading window.
     */
    closeLoadingWindow() {
      BrowserWindowEx.getWin({
        name: "loading-window",
      })?.close();
    },

    /**
     * Get current Live2D model profile.
     */
    getCurrentProfile() {
      return live2DModelManager.getCurrentProfile();
    },

    /**
     * Quit app.
     */
    quit() {
      app.quit();
    },

    /**
     * Open models window.
     */
    openModelsWindow() {
      createModelsWindow(staticServeOrigin);
    },

    /**
     * Open plugins window.
     */
    openPluginsWindow() {
      createPluginsWindow(staticServeOrigin);
    },

    /**
     * Open setting window.
     */
    openSettingWindow() {
      createSettingWindow(staticServeOrigin);
    },
  });

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

import { app } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { live2DModelManager } from "../modules/live2DModelsManager";
import { staticServeManager } from "../modules/staticServeManager";
import { useIgnoreMouseEventsByAlpha } from "./composables/useIgnoreMouseEventsByAlpha";
import { useSystemMouseMoveEvent } from "./composables/useSystemMouseMoveEvent";
import { createModelsWindow } from "./createModelsWindow";
import { createPluginsWindow } from "./createPluginsWindow";
import { createSettingWindow } from "./createSettingWindow";
import { settingManager } from "../modules/settingManager";
import {
  Setting,
  SettingMethodsByMain,
} from "live2d-copilot-shared/src/Setting";

export const DESKTOP_PET_ROUTE_PATH = `/desktop-pet-window`;

/**
 * Create desktop pet window
 */
export async function createDesktopPetWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${DESKTOP_PET_ROUTE_PATH}`,
    {
      show: false,
      name: "desktop-pet-window",
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
      fullscreen: true,
      movable: false,
      skipTaskbar: true,
      focusable: false,
      alwaysOnTop: (await settingManager.getSetting()).alwaysOnTop,
    }
  );

  if (!win) return;

  // Preload of the window.
  preload(win);

  // Once the window is ready after creation.
  win.once("ready-to-show", () => {
    win.show();
  });

  // Auto set IgnoreMouseEvents by alpha.
  useIgnoreMouseEventsByAlpha(win);

  // Sending system level mouse movement events to web contents
  useSystemMouseMoveEvent(win);

  // Get the web contents api
  const webApi = win.rpc.use(win.name);

  // Handle current model change event
  function onCurrentModelChange() {
    // Forward the currentModelChange event to a webpage
    webApi.onCurrentModelChange();
  }

  // Handle setting change event
  function onSettingChange(data: Setting) {
    // Set the alwaysOnTop property of the window to the value of the setting
    if (win?.isAlwaysOnTop() !== data.alwaysOnTop) {
      win?.setAlwaysOnTop(data.alwaysOnTop);
    }
  }

  // Bind event listeners.
  live2DModelManager.eventBus.on("currentModelChange", onCurrentModelChange);
  settingManager.eventBus.on("change", onSettingChange);

  // Unbind event listeners.
  win.on("close", () => {
    live2DModelManager.eventBus.off("currentModelChange", onCurrentModelChange);
    settingManager.eventBus.off("change", onSettingChange);
  });

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  win.rpc.register<SettingMethodsByMain>("setting", {
    getSetting: settingManager.getSetting.bind(settingManager),
    setSetting: settingManager.setSetting.bind(settingManager),
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
    getCurrentProfile:
      live2DModelManager.getCurrentProfile.bind(live2DModelManager),

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
      createModelsWindow();
    },

    /**
     * Open plugins window.
     */
    openPluginsWindow() {
      createPluginsWindow();
    },

    /**
     * Open setting window.
     */
    openSettingWindow() {
      createSettingWindow();
    },
  });

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

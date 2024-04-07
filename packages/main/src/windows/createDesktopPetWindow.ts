import { app, screen } from "electron";
import { Setting } from "live2d-copilot-shared/src/Setting";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { live2dModelsManager } from "../modules/live2dModelsManager";
import { settingManager } from "../modules/settingManager";
import { staticServeManager } from "../modules/staticServeManager";
import { useIgnoreMouseEventsByAlpha } from "./composables/useIgnoreMouseEventsByAlpha";
import { useSystemMouseMoveEvent } from "./composables/useSystemMouseMoveEvent";
import { createModelsWindow } from "./createModelsWindow";
import { createPluginsWindow } from "./createPluginsWindow";
import { createSettingWindow } from "./createSettingWindow";
import { preload as preloadOfChatTools } from "./preloads/chatTools";
import { preload as preloadOfSetting } from "./preloads/setting";

export const DESKTOP_PET_ROUTE_PATH = `/desktop-pet-window`;

/**
 * Create desktop pet window
 */
export async function createDesktopPetWindow() {
  // Get setting.
  const setting = await settingManager.getSetting();

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
      // fullscreen: true,
      width: screen.getPrimaryDisplay().workAreaSize.width,
      height: screen.getPrimaryDisplay().workAreaSize.height,
      movable: false,
      minimizable: false,
      maximizable: false,
      // skipTaskbar: true,
      alwaysOnTop: setting.alwaysOnTop,
    }
  );

  if (!win) return;

  // Preload of the window.
  preload(win);

  // Preload of setting.
  preloadOfSetting(win);

  // Preload of chat tools.
  preloadOfChatTools(win);

  // Once the window is ready after creation.
  win.once("ready-to-show", () => {
    win.show();
  });

  // Auto set IgnoreMouseEvents by alpha.
  useIgnoreMouseEventsByAlpha(win);

  // Sending system level mouse movement events to web contents
  useSystemMouseMoveEvent(win);

  // Handle setting change event
  function onSettingChange(data: Setting) {
    // Set the alwaysOnTop property of the window to the value of the setting
    if (win?.isAlwaysOnTop() !== data.alwaysOnTop) {
      win?.focus();
      win?.setAlwaysOnTop(data.alwaysOnTop);
    }
  }

  // Bind event listeners.
  settingManager.eventBus.on("change", onSettingChange);

  // Unbind event listeners.
  win.on("close", () => {
    settingManager.eventBus.off("change", onSettingChange);
  });

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  /**
   * Registering methods for webpage calls
   */
  return win.rpc.register(win.name, {
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
      live2dModelsManager.getCurrentProfile.bind(live2dModelsManager),

    /**
     * Save Live2D model profile.
     */
    saveProfile: live2dModelsManager.saveProfile.bind(live2dModelsManager),

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
}

export type Methods = ReturnType<typeof preload>;

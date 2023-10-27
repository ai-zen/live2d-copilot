import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { live2DModelManager } from "../modules/Live2DModelsManager";
import { useIgnoreMouseEventsByAlpha } from "./composables/useIgnoreMouseEventsByAlpha";
import { useWindowMove } from "./composables/useWindowMove";
import { createBrowserWindowEx } from "./createBrowserWindowEx";

export const DESKTOP_PET_ROUTE_PATH = `/desktop-pet-window`;

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 720;

const MIN_WIDTH = 360;
const MIN_HEIGHT = 360;

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
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
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
     * Enable window movement for web contents.
     */
    ...useWindowMove(win),
  });

  return {
    callRecord,
  };
}

export type CallRecord = ReturnType<typeof preload>["callRecord"];

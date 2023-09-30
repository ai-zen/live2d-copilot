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

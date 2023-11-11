import { app, BrowserWindow } from "electron";
import { useAppProtocol } from "./composables/useAppProtocol";
import { useStaticServeOrigin } from "./composables/useStaticServeOrigin";
import { live2DModelManager } from "./modules/Live2DModelsManager";
import { createDesktopPetWindow } from "./windows/createDesktopPetWindow";
import { createLoadingWindow } from "./windows/createLoadingWindow";
import { steamworksManager } from "./modules/SteamworksManager";

async function main() {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
  }

  // Use static serve origin.
  let { staticServeOrigin } = await useStaticServeOrigin();

  // Use app protocol.
  const { handleAppProtocol } = useAppProtocol();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", async () => {
    // Create Loading.
    createLoadingWindow(staticServeOrigin);

    // Handle app protocol.
    handleAppProtocol();

    // Init Steamworks.
    steamworksManager.init();

    // Load Live2D Manager Config
    await live2DModelManager.loadConfig();

    // Release Live2D Models Files to UserData.
    await live2DModelManager.releaseFilesToUserData();

    // Create the Desktop Pet Window.
    createDesktopPetWindow(staticServeOrigin);
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      // Create the Desktop Pet Window.
      createDesktopPetWindow(staticServeOrigin);
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
}

main();

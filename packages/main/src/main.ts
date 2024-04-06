import { app, BrowserWindow } from "electron";
import { useAppProtocol } from "./composables/useAppProtocol";
import { live2dModelsManager } from "./modules/live2dModelsManager";
import { staticServeManager } from "./modules/staticServeManager";
import { steamworksManager } from "./modules/steamworksManager";
import { createDesktopPetWindow } from "./windows/createDesktopPetWindow";
import { createLoadingWindow } from "./windows/createLoadingWindow";
import { createTray } from "./windows/createTray";
import { settingManager } from "./modules/settingManager";
import { i18n } from "./modules/i18n";
import { workshopManager } from "./modules/workshopManager";

console.log("process.versions.modules", process.versions.modules);

async function main() {
  // Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require("electron-squirrel-startup")) {
    app.quit();
  }

  // Use app protocol.
  const { handleAppProtocol } = useAppProtocol();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", async () => {
    // Create Loading.
    createLoadingWindow();

    // Handle app protocol.
    handleAppProtocol();

    // Init static serve.
    await staticServeManager.init();

    // Init Steamworks.
    await steamworksManager.init();

    // Load subscribed items.
    workshopManager.init();

    // Load Settings.
    await settingManager.loadSetting();

    // Init i18n.
    await i18n.init();

    // Load Live2D Model Manager configs.
    await live2dModelsManager.loadConfig();

    // Release Live2D Models Files to UserData.
    await live2dModelsManager.releaseFilesToUserData();

    // Create system tray.
    createTray();

    // Create the Desktop Pet Window.
    createDesktopPetWindow();
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
      createDesktopPetWindow();
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
}

main();

import { Menu, dialog } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { live2DModelManager } from "../modules/live2DModelsManager";
import { staticServeManager } from "../modules/staticServeManager";
import { steamworksManager } from "../modules/steamworksManager";

export const MODELS_ROUTE_PATH = `/models-window`;

/**
 * Create models window
 */
export async function createModelsWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${MODELS_ROUTE_PATH}`,
    {
      name: "models-window",
      width: 1430,
      height: 1014,
      minWidth: 800,
      minHeight: 568,
    }
  );

  if (!win) return;

  Menu.setApplicationMenu(null);

  // Preload of the window.
  preload(win);

  return win;
}

/**
 * Preload of the desktop pet window
 */
function preload(win: BrowserWindowEx) {
  const methods = win.rpc.register(win.name, {
    showOpenDialog(options: Electron.OpenDialogOptions) {
      return dialog.showOpenDialog(options);
    },

    loadProfiles: live2DModelManager.loadProfiles.bind(live2DModelManager),
    getCurrentProfile:
      live2DModelManager.getCurrentProfile.bind(live2DModelManager),
    setCurrent: live2DModelManager.setCurrent.bind(live2DModelManager),
    buildProfile: live2DModelManager.buildProfile.bind(live2DModelManager),

    createItem: steamworksManager.createItem.bind(steamworksManager),
    updateItem: steamworksManager.updateItem.bind(steamworksManager),
    getAllItems: steamworksManager.getAllItems.bind(steamworksManager),
    getItem: steamworksManager.getItem.bind(steamworksManager),
    getSubscribedItems:
      steamworksManager.getSubscribedItems.bind(steamworksManager),
    subscribe: steamworksManager.subscribe.bind(steamworksManager),
    unsubscribe: steamworksManager.unsubscribe.bind(steamworksManager),
    download: steamworksManager.download.bind(steamworksManager),
    downloadInfo: steamworksManager.downloadInfo.bind(steamworksManager),
    installInfo: steamworksManager.installInfo.bind(steamworksManager),
  });

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

import { dialog } from "electron";
import { BrowserWindowEx } from "../../classes/BrowserWindowEx";
import { workshopManager } from "../../modules/workshopManager";
import { steamworksManager } from "../../modules/steamworksManager";

export function preload(win: BrowserWindowEx) {
  return win.rpc.register("workshop", {
    showOpenDialog(options: Electron.OpenDialogOptions) {
      return dialog.showOpenDialog(options);
    },
    subscribe: workshopManager.subscribe.bind(workshopManager),
    unsubscribe: workshopManager.unsubscribe.bind(workshopManager),
    download: workshopManager.download.bind(workshopManager),
    getLoadedSubscribedItems:
      workshopManager.getLoadedSubscribedItems.bind(workshopManager),
    getAllItems: steamworksManager.getAllItems.bind(steamworksManager),
    getItems: steamworksManager.getItems.bind(steamworksManager),
    getItem: steamworksManager.getItem.bind(steamworksManager),
    createItem: steamworksManager.createItem.bind(steamworksManager),
    updateItem: steamworksManager.updateItem.bind(steamworksManager),
  });
}

export type Methods = ReturnType<typeof preload>;

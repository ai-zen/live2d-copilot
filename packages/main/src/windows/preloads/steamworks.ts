import { dialog } from "electron";
import { BrowserWindowEx } from "../../classes/BrowserWindowEx";
import { steamworksManager } from "../../modules/steamworksManager";

export function preload(win: BrowserWindowEx) {
  return win.rpc.register("steamworks", {
    showOpenDialog(options: Electron.OpenDialogOptions) {
      return dialog.showOpenDialog(options);
    },
    createItem: steamworksManager.createItem.bind(steamworksManager),
    updateItem: steamworksManager.updateItem.bind(steamworksManager),
    getAllItems: steamworksManager.getAllItems.bind(steamworksManager),
    getItem: steamworksManager.getItem.bind(steamworksManager),
    getItems: steamworksManager.getItems.bind(steamworksManager),
    getSubscribedIds:
      steamworksManager.getSubscribedIds.bind(steamworksManager),
    subscribe: steamworksManager.subscribe.bind(steamworksManager),
    unsubscribe: steamworksManager.unsubscribe.bind(steamworksManager),
    download: steamworksManager.download.bind(steamworksManager),
    downloadInfo: steamworksManager.downloadInfo.bind(steamworksManager),
    installInfo: steamworksManager.installInfo.bind(steamworksManager),
    itemState: steamworksManager.itemState.bind(steamworksManager),
  });
}

export type Methods = ReturnType<typeof preload>;

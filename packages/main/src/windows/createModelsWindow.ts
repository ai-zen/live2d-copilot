import { Menu, dialog } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import {
  Live2DModelProfile,
  live2DModelManager,
} from "../modules/Live2DModelsManager";
import { steamworksManager } from "../modules/SteamworksManager";
import fsp from "node:fs/promises";
import path from "node:path";
import { staticServeManager } from "../modules/StaticServeManager";

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
    createItem: steamworksManager.createItem.bind(steamworksManager),
    updateItem: steamworksManager.updateItem.bind(steamworksManager),
    getAllItems: steamworksManager.getAllItems.bind(steamworksManager),
    getItem: steamworksManager.getItem.bind(steamworksManager),
    subscribe: steamworksManager.subscribe.bind(steamworksManager),
    unsubscribe: steamworksManager.unsubscribe.bind(steamworksManager),
    download: steamworksManager.download.bind(steamworksManager),
    downloadInfo: steamworksManager.downloadInfo.bind(steamworksManager),

    async buildProfile(info: {
      title: string;
      description: string;
      contentPath: string;
      previewPath: string;
    }) {
      const profileJsonPath = path.join(info.contentPath, "profile.json");
      let profile: Live2DModelProfile = {
        Version: 1,
        Model3: "",
        Title: "",
        Description: "",
        Preview: "",
        Skins: [],
      };
      try {
        const json = await fsp.readFile(profileJsonPath, { encoding: "utf-8" });
        profile = JSON.parse(json);
      } catch {}
      const files = await fsp.readdir(info.contentPath);
      const model3 = files.find((file) => file.endsWith("model3.json"));
      if (!model3) throw new Error("文件夹中未发现 model3.json 文件");
      profile.Model3 = model3;
      profile.Title = info.title;
      profile.Description = info.description;
      profile.Preview = "preview.png";
      const source = path.normalize(info.previewPath);
      const dest = path.normalize(path.join(info.contentPath, "preview.png"));
      if (source != dest) {
        await fsp.cp(source, dest);
      }
      await fsp.writeFile(profileJsonPath, JSON.stringify(profile, null, 4), {
        encoding: "utf-8",
      });
    },
  });

  return {
    methods,
  };
}

export type Methods = ReturnType<typeof preload>["methods"];

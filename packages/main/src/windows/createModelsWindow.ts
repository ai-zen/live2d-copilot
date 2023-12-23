import { Menu, dialog } from "electron";
import { BrowserWindowEx } from "../class/BrowserWindowEx";
import { createBrowserWindowEx } from "./createBrowserWindowEx";
import {
  Live2DModelProfile,
  live2DModelManager,
} from "../modules/Live2DModelsManager";
import { steamworksManager } from "../modules/SteamworksManager";
import { workshop } from "@ai-zen/steamworks.js/client";
import fsp from "node:fs/promises";
import path from "node:path";
import { UpdateStatus } from "live2d-copilot-shader/src/Steamworks";

export const MODELS_ROUTE_PATH = `/models-window`;

/**
 * Create models window
 * @param staticServeOrigin
 */
export async function createModelsWindow(staticServeOrigin: string) {
  // Create window.
  const win = createBrowserWindowEx(
    `${staticServeOrigin}${MODELS_ROUTE_PATH}`,
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
    loadProfiles() {
      return live2DModelManager.loadProfiles();
    },

    getCurrentProfile() {
      return live2DModelManager.getCurrentProfile();
    },

    setCurrent(model3: string) {
      return live2DModelManager.setCurrent(model3);
    },

    showOpenDialog(options: Electron.OpenDialogOptions) {
      return dialog.showOpenDialog(options);
    },

    createItem() {
      return steamworksManager.createItem();
    },

    updateItem(
      itemId: bigint,
      updateDetails: workshop.UgcUpdate,
      progressCallback: (data: {
        status: UpdateStatus;
        progress: bigint;
        total: bigint;
      }) => void,
      progressCallbackInterval: number
    ) {
      return steamworksManager.updateItem(
        itemId,
        updateDetails,
        progressCallback,
        progressCallbackInterval
      );
    },

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

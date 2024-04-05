import { Menu } from "electron";
import fsp from "fs/promises";
import { PickRequired } from "live2d-copilot-shared/src/Common";
import { Live2DModelProfileV1 } from "live2d-copilot-shared/src/Live2DModels";
import { UGCPublishForm } from "live2d-copilot-shared/src/UGCPublish";
import path from "node:path";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { live2dModelsManager } from "../modules/live2dModelsManager";
import { staticServeManager } from "../modules/staticServeManager";
import { preload as preloadOfSetting } from "./preloads/setting";
import { preload as preloadOfSteamworks } from "./preloads/steamworks";

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

  // Preload of setting.
  preloadOfSetting(win);

  // Preload of steamworks.
  preloadOfSteamworks(win);

  return win;
}

/**
 * Preload of the models window
 */
function preload(win: BrowserWindowEx) {
  return win.rpc.register(win.name, {
    loadProfile: live2dModelsManager.loadProfile.bind(live2dModelsManager),
    loadProfiles: live2dModelsManager.loadProfiles.bind(live2dModelsManager),
    getCurrentProfile:
      live2dModelsManager.getCurrentProfile.bind(live2dModelsManager),
    setCurrent: live2dModelsManager.setCurrent.bind(live2dModelsManager),
    async buildProfile(
      info: PickRequired<UGCPublishForm, "contentPath" | "previewPath"> &
        PickRequired<
          Live2DModelProfileV1,
          "title" | "description" | "chat" | "tts"
        >
    ) {
      // Copy preview image
      const source = path.normalize(info.previewPath);
      const dest = path.normalize(path.join(info.contentPath, "preview.png"));
      if (source != dest) {
        await fsp.cp(source, dest);
      }

      // Find model3.json
      const files = await fsp.readdir(info.contentPath);
      const model3 = files.find((file) => file.endsWith("model3.json"));
      if (!model3) throw new Error("Folder does not contain model3.json file.");

      // Output profile file
      let profile: Live2DModelProfileV1 = {
        version: 1,
        model3: model3,
        title: info.title,
        description: info.description,
        preview: "preview.png",
        chat: info.chat,
        tts: info.tts,
      };
      await fsp.writeFile(
        path.join(info.contentPath, "profile.json"),
        JSON.stringify(profile, null, 4),
        {
          encoding: "utf-8",
        }
      );
    },
  });
}

export type Methods = ReturnType<typeof preload>;

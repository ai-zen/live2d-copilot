import { Menu } from "electron";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import { staticServeManager } from "../modules/staticServeManager";
import { preload as preloadOfSetting } from "./preloads/setting";
import { preload as preloadOfSteamworks } from "./preloads/steamworks";
import fsp from "fs/promises";
import { PickRequired } from "live2d-copilot-shared/src/Common";
import { ChatToolProfileV1 } from "live2d-copilot-shared/src/ChatTool";
import { UGCPublishForm } from "live2d-copilot-shared/src/UGCPublish";
import path from "node:path";

export const PLUGINS_ROUTE_PATH = `/plugins-window`;

/**
 * Create plugins window
 */
export async function createPluginsWindow() {
  // Create window.
  const win = BrowserWindowEx.create(
    `${staticServeManager.origin}${PLUGINS_ROUTE_PATH}`,
    {
      name: "plugins-window",
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
 * Preload of the plugins window
 */
function preload(win: BrowserWindowEx) {
  return win.rpc.register(win.name, {
    async buildProfile(
      info: PickRequired<UGCPublishForm, "contentPath" | "previewPath"> &
        PickRequired<ChatToolProfileV1, "title" | "description" | "function">
    ) {
      // Copy preview image
      const source = path.normalize(info.previewPath);
      const dest = path.normalize(path.join(info.contentPath, "preview.png"));
      if (source != dest) {
        await fsp.cp(source, dest);
      }

      // Find index.js
      const files = await fsp.readdir(info.contentPath);
      const indexJs = files.find((file) => file.endsWith("index.js"));
      if (!indexJs) throw new Error("Folder does not contain index.js file.");

      // Output profile file
      let profile: ChatToolProfileV1 = {
        version: 1,
        title: info.title,
        description: info.description,
        preview: "preview.png",
        type: "function",
        function: info.function,
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

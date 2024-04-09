import fsp from "fs/promises";
import {
  ChatToolProfileEx,
  ChatToolProfileV1,
} from "live2d-copilot-shared/src/ChatTool";
import {
  ItemTypeTags,
  WorkshopExtendItem,
} from "live2d-copilot-shared/src/Steamworks";
import path from "path";
import url from "url";
import { broadcaster } from "./broadcaster";
import { MainWorkshopManager, workshopManager } from "./workshopManager";

export class MainChatToolsManager {
  static instance = new MainChatToolsManager();

  private constructor() {}

  isReady = false;
  isLoading = false;
  profiles = new Map<bigint, ChatToolProfileEx>();
  functionMap = new Map<string, ChatToolProfileEx>();

  async init() {
    try {
      await this.loadProfiles();
    } catch (error) {
      console.error(error);
    }

    broadcaster.on("workshop:item-installed", async (_itemId, item) => {
      if (
        MainWorkshopManager.isTagsIntersect(item?.tags, [
          ItemTypeTags.ChatTools,
        ])
      ) {
        const profile = await this.getProfile(item);
        if (!profile) return;
        this.profiles.set(profile._itemId, profile);
        this.functionMap.set(profile.function.name, profile);
        broadcaster.broadcast("chat-tools:profile-add", profile);
      }
    });

    broadcaster.on("workshop:unsubscribed", (itemId, item) => {
      if (
        MainWorkshopManager.isTagsIntersect(item?.tags, [
          ItemTypeTags.ChatTools,
        ])
      ) {
        const profile = this.profiles.get(itemId);
        if (!profile) return;
        this.profiles.delete(itemId);
        this.functionMap.delete(profile.function.name);
        broadcaster.broadcast("chat-tools:profile-removed", profile);
      }
    });
  }

  async getProfile(item: WorkshopExtendItem) {
    let folder = item.installInfo?.folder;
    if (!folder) return;
    const json = await fsp.readFile(
      path.resolve(folder, "profile.json"),
      "utf-8"
    );
    const profile = JSON.parse(json) as ChatToolProfileV1;
    return <ChatToolProfileEx>{
      ...profile,
      _itemId: item.itemId,
      _dir: path.resolve(folder),
      _index: path.resolve(folder, "index.mjs"),
    };
  }

  async loadProfiles() {
    try {
      this.isLoading = true;
      let items = workshopManager.getInstalledItems();
      items = items.filter((x) =>
        MainWorkshopManager.isTagsIntersect(x?.tags, [ItemTypeTags.ChatTools])
      );
      const profiles1 = await Promise.all(items.map(this.getProfile));
      const profiles2 = profiles1.filter(Boolean) as ChatToolProfileEx[];
      profiles2.forEach((x) => {
        this.profiles.set(x._itemId, x);
        this.functionMap.set(x.function.name, x);
      });
      this.isReady = true;
      broadcaster.broadcast("chat-tools:profiles-loaded", profiles2);
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  async getLoadedProfiles() {
    return Array.from(this.profiles.values());
  }

  async getFunctionCallResult(method_name: string, parsed_args: any) {
    const matched = this.functionMap.get(method_name);
    if (!matched) throw new Error(`The method ${method_name} not found.`);
    let module: any;

    // Allow import any modules, is it dangerous to do so? Yes, it can be dangerous.
    module = await import(url.pathToFileURL(matched._index).href);

    if (!module[method_name]) {
      throw new Error(`The method ${method_name} not found.`);
    }

    try {
      return module[method_name](parsed_args);
    } catch (error) {
      throw new Error(`Failed to call method ${method_name}.`);
    }
  }
}

export const chatToolsManager = MainChatToolsManager.instance;

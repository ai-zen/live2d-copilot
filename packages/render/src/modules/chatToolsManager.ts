import EventBus from "@ai-zen/event-bus";
import type { Methods } from "live2d-copilot-main/src/windows/preloads/chatTools";
import { ChatToolProfileEx } from "live2d-copilot-shared/src/ChatTool";
import { WorkshopExtendItem } from "live2d-copilot-shared/src/Steamworks";
import { reactive } from "vue";
import { broadcaster } from "./broadcaster";
import { rpc } from "./rpc";

export class RenderChatToolsManager {
  static instance = new RenderChatToolsManager();

  eventBus = new EventBus();

  chatToolsApi = rpc.use<Methods>("chatTools");

  state = reactive({
    isSyncing: false,
    isReady: false,
    profiles: new Map<bigint, ChatToolProfileEx>(),
  });

  async syncProfiles() {
    if (this.state.isSyncing) {
      return this.eventBus.promise("ready") as Promise<WorkshopExtendItem[]>;
    }
    try {
      this.state.isSyncing = true;
      const profiles = await this.chatToolsApi.getLoadedProfiles();
      profiles.forEach((x) => {
        this.state.profiles.set(x._itemId, x);
      });
      this.state.isReady = true;
      this.eventBus.emit("ready", profiles);
      return profiles;
    } finally {
      this.state.isSyncing = false;
    }
  }

  getToolCallResult(method: string, parsed_args: any) {
    return this.chatToolsApi.getToolCallResult(method, parsed_args);
  }

  constructor() {
    broadcaster.on("chat-tools:profiles-loaded", () => {
      this.syncProfiles();
    });

    broadcaster.on("chat-tools:profile-add", (x: ChatToolProfileEx) => {
      this.state.profiles.set(x._itemId, x);
    });

    broadcaster.on("chat-tools:profile-removed", (x: ChatToolProfileEx) => {
      this.state.profiles.delete(x._itemId);
    });

    this.syncProfiles();
  }
}

export const chatToolsManager = RenderChatToolsManager.instance;

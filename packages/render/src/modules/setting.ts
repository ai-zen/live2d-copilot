import EventBus from "@ai-zen/event-bus";
import type { Methods } from "live2d-copilot-main/src/windows/preloads/setting";
import {
  Setting,
  SettingMethodsRenderAPI,
} from "live2d-copilot-shared/src/Setting";
import { reactive } from "vue";
import { rpc } from "../modules/rpc";

export class RenderSettingManager {
  static instance = new RenderSettingManager();

  eventBus = new EventBus();

  winApi = rpc.use<Methods>("setting");

  state = reactive({
    isLoading: true,
    isReady: false,
    isSaving: false,
    data: null as Setting | null,
  });

  async loadSetting() {
    try {
      this.state.isLoading = true;
      this.state.data = await this.winApi.getSetting();
      this.state.isReady = true;
      this.eventBus.emit("ready", this.state.data);
      this.eventBus.emit("change", this.state.data);
    } catch (error: any) {
      console.error(
        `Failed to get settings: ${error?.message || "unknown error"}`
      );
    } finally {
      this.state.isLoading = false;
    }
  }

  async saveSetting() {
    try {
      this.state.isSaving = true;
      await this.winApi.setSetting(JSON.parse(JSON.stringify(this.state.data)));
    } catch (error: any) {
      console.error(
        `Failed to set settings: ${error?.message || "unknown error"}`
      );
    } finally {
      this.state.isSaving = false;
    }
  }

  constructor() {
    rpc.register<SettingMethodsRenderAPI>("setting", {
      onSettingChange: (newSetting: Setting) => {
        console.log("[setting.ts] onSettingChange", newSetting);
        this.state.data = newSetting;
        this.eventBus.emit("change", this.state.data);
      },
    });

    this.loadSetting();
  }
}

export const settingManager = RenderSettingManager.instance;

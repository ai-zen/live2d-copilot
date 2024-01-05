import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import {
  DownloadInfo,
  InstallInfo,
} from "live2d-copilot-shader/src/Steamworks";
import { reactive, watch } from "vue";
import { rpc } from "../../../modules/rpc";

const winApi = rpc.use<Methods>("models-window");

export class WorkshopItemsWatcher {
  static instance = new WorkshopItemsWatcher();
  private constructor() {
    watch(
      () => this.state.watchSet.size,
      (size) => {
        if (size && !this.timer) this.setTimer();
        if (!size && this.timer) this.clearTimer();
      }
    );
  }

  state = reactive({
    watchSet: new Set<bigint>(),
    downloadInfoMap: new Map<bigint, DownloadInfo | null>(),
    installInfoMap: new Map<bigint, InstallInfo | null>(),
  });

  private timer = 0;
  interval = 1000;
  setTimer() {
    this.timer = window.setInterval(this.update, this.interval);
  }

  clearTimer() {
    window.clearInterval(this.timer);
    this.timer = 0;
  }

  private update() {
    console.log(`[WorkshopItemsWatcher] update, size: ${this.state.watchSet}`);
    this.state.watchSet.forEach((itemId) => this.updateItem(itemId));
  }

  private async updateItem(itemId: bigint) {
    console.log(`[WorkshopItemsWatcher] updateItem, itemId: ${itemId}`);
    const [downloadInfo, installInfo] = await Promise.all([
      winApi.downloadInfo(itemId),
      winApi.installInfo(itemId),
    ]);
    this.state.downloadInfoMap.set(itemId, downloadInfo as DownloadInfo | null);
    this.state.installInfoMap.set(itemId, installInfo as InstallInfo | null);
  }

  watch(itemId: bigint) {
    this.state.watchSet.add(itemId);
  }

  unwatch(itemId: bigint) {
    this.state.watchSet.delete(itemId);
  }

  getItemInfo(itemId: bigint) {
    return {
      downloadInfo: this.state.downloadInfoMap.get(itemId),
      installInfo: this.state.installInfoMap.get(itemId),
    };
  }

  async getItemInfoWithUpdate(itemId: bigint) {
    await this.updateItem(itemId);
    return this.getItemInfo(itemId);
  }
}

export const workshopItemsWatcher = WorkshopItemsWatcher.instance;

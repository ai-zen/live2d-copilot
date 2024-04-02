import EventBus from "@ai-zen/event-bus";
import type { Methods } from "live2d-copilot-main/src/windows/preloads/steamworks";
import {
  DownloadInfo,
  InstallInfo,
  ItemState,
} from "live2d-copilot-shared/src/Steamworks";
import { reactive, watch } from "vue";
import { rpc } from "../modules/rpc";

export interface WorkshopItemStatusData {
  itemId: bigint;
  itemState: ItemState;
  downloadInfo: DownloadInfo | null;
  installInfo: InstallInfo | null;
}

export class Workshop {
  static instance = new Workshop();

  eventBus = new EventBus();

  winApi = rpc.use<Methods>("steamworks");

  private constructor() {
    watch(
      () => this.state.watchIds.size,
      (size) => {
        if (size && !this.watchTimer) this.setWatchTimer();
        if (!size && this.watchTimer) this.clearWatchTimer();
      }
    );
  }

  state = reactive({
    isLoading: false,
    isReady: false,
    subscribedIds: new Set() as Set<bigint>,
    subscribing: new Set() as Set<bigint>,
    unsubscribing: new Set() as Set<bigint>,
    watchIds: new Set<bigint>(),
    statusDataMap: new Map<bigint, WorkshopItemStatusData>(),
  });

  private watchTimer = 0;
  watchInterval = 500;
  setWatchTimer() {
    this.watchTimer = window.setInterval(
      this.updateWatchItemsStatusData.bind(this),
      this.watchInterval
    );
  }

  clearWatchTimer() {
    clearInterval(this.watchTimer);
    this.watchTimer = 0;
  }

  updateWatchItemsStatusData() {
    const watchIds = Array.from(this.state.watchIds);
    return Promise.all(watchIds.map(this.updateItemStatusData.bind(this)));
  }

  updateSubscribedItemsStatusData() {
    const subscribedIds = Array.from(this.state.subscribedIds);
    return Promise.all(subscribedIds.map(this.updateItemStatusData.bind(this)));
  }

  async updateItemStatusData(itemId: bigint) {
    const [downloadInfo, installInfo, itemState] = await Promise.all([
      this.winApi.downloadInfo(itemId),
      this.winApi.installInfo(itemId),
      this.winApi.itemState(itemId),
    ]);

    const statusData: WorkshopItemStatusData = {
      itemId: itemId,
      downloadInfo: downloadInfo as DownloadInfo,
      installInfo: installInfo as InstallInfo,
      itemState: itemState as ItemState,
    };

    this.state.statusDataMap.set(itemId, statusData);
    this.eventBus.emit("updated", statusData);
    this.eventBus.emit(`updated ${itemId}`, statusData);

    if (
      statusData.itemState & ItemState.DOWNLOAD_PENDING ||
      statusData.itemState & ItemState.DOWNLOADING
    ) {
      this.watchItem(itemId);
    }

    if (
      statusData.itemState & ItemState.INSTALLED &&
      !(statusData.itemState & ItemState.DOWNLOAD_PENDING) &&
      !(statusData.itemState & ItemState.DOWNLOADING)
    ) {
      this.unwatchItem(itemId);
    }

    console.log("statusData", statusData);

    return statusData;
  }

  watchItem(itemId: bigint) {
    this.state.watchIds.add(itemId);
  }

  unwatchItem(itemId: bigint) {
    this.state.watchIds.delete(itemId);
  }

  getCachedItemStatusData(itemId: bigint) {
    return this.state.statusDataMap.get(itemId);
  }

  async getSubscribedIds() {
    try {
      this.state.isLoading = true;
      this.state.subscribedIds = reactive(
        new Set(await this.winApi.getSubscribedIds())
      );
      this.state.isReady = true;
      return Array.from(this.state.subscribedIds);
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      this.state.isLoading = false;
    }
  }

  async subscribe(itemId: bigint) {
    try {
      this.eventBus.emit("before-subscribed", itemId);
      this.state.subscribing.add(itemId);
      await this.winApi.subscribe(itemId);
      this.state.subscribedIds.add(itemId);
      let statusData = await this.updateItemStatusData(itemId);
      if (!statusData?.installInfo) {
        this.download(itemId);
      }
      statusData = await this.updateItemStatusData(itemId);
      this.eventBus.emit("subscribed", itemId, statusData);
    } catch (error) {
      console.error(error);
    } finally {
      this.state.subscribing.delete(itemId);
    }
  }

  async unsubscribe(itemId: bigint) {
    try {
      const statusData = this.state.statusDataMap.get(itemId);
      this.eventBus.emit("before-unsubscribed", itemId, statusData);
      this.state.unsubscribing.add(itemId);
      await this.winApi.unsubscribe(itemId);
      this.state.subscribedIds.delete(itemId);
      this.state.statusDataMap.delete(itemId);
      // await this.updateItemStatusData(itemId);
      this.eventBus.emit("unsubscribed", itemId, statusData);
    } catch (error) {
      console.error(error);
    } finally {
      this.state.unsubscribing.delete(itemId);
    }
  }

  isSubscribed(itemId: bigint) {
    return this.state.subscribedIds.has(itemId);
  }

  isSubscribing(itemId: bigint) {
    return this.state.subscribing.has(itemId);
  }

  isUnsubscribing(itemId: bigint) {
    return this.state.unsubscribing.has(itemId);
  }

  isDownloading(itemId: bigint) {
    const statusData = this.getCachedItemStatusData(itemId);
    return statusData && statusData.itemState & ItemState.DOWNLOADING;
  }

  async download(itemId: bigint) {
    try {
      await this.winApi.download(itemId, false);
      this.watchItem(itemId);
    } catch (error) {
      console.error(error);
    }
  }
}

export const workshop = Workshop.instance;

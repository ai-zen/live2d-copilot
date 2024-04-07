import EventBus from "@ai-zen/event-bus";
import {
  ItemState,
  WorkshopExtendItem,
  WorkshopItem,
} from "live2d-copilot-shared/src/Steamworks";
import { broadcaster } from "./broadcaster";
import { steamworksManager } from "./steamworksManager";

export class MainWorkshopManager {
  static instance = new MainWorkshopManager();

  private constructor() {}

  eventBus = new EventBus();

  isLoading = false;
  isReady = false;
  subscribed = new Map() as Map<bigint, WorkshopExtendItem>;

  subscribing = new Set() as Set<bigint>;
  unsubscribing = new Set() as Set<bigint>;

  watchIds = new Set<bigint>();

  private watchTimer = 0;
  private watchInterval = 500;

  init() {
    try {
      return this.loadSubscribedItems();
    } catch (error) {
      console.error(error);
    }
  }

  private setWatchTimer() {
    this.watchTimer = setInterval(
      this.updateWatchItemsStatus.bind(this),
      this.watchInterval
    ) as any;
  }

  private clearWatchTimer() {
    clearInterval(this.watchTimer);
    this.watchTimer = 0;
  }

  watchItem(itemId: bigint) {
    this.watchIds.add(itemId);
    if (this.watchIds.size && !this.watchTimer) this.setWatchTimer();
  }

  unwatchItem(itemId: bigint) {
    this.watchIds.delete(itemId);
    if (!this.watchIds.size && this.watchTimer) this.clearWatchTimer();
  }

  private updateWatchItemsStatus() {
    const watchIds = Array.from(this.watchIds);
    return Promise.all(
      watchIds.map(this.updateSubscribedItemStatus.bind(this))
    );
  }

  async updateSubscribedItemStatus(itemId: bigint) {
    const item = this.subscribed.get(itemId);
    if (!item) return;

    const [downloadInfo, installInfo, itemState] = await Promise.all([
      steamworksManager.downloadInfo(itemId),
      steamworksManager.installInfo(itemId),
      steamworksManager.itemState(itemId),
    ]);

    item.downloadInfo = downloadInfo;
    item.installInfo = installInfo;
    item.itemState = itemState;

    this.handelSubscribedItemStatus(itemId);

    broadcaster.broadcast("workshop:item-status-updated", itemId, item);

    if (installInfo) {
      broadcaster.broadcast("workshop:item-installed", itemId, item);
    }

    return item;
  }

  private handelSubscribedItemStatus(itemId: bigint) {
    const item = this.subscribed.get(itemId);
    if (!item) return;

    if (
      !item?.installInfo &&
      !(item.itemState & ItemState.DOWNLOAD_PENDING) &&
      !(item.itemState & ItemState.DOWNLOADING)
    ) {
      this.download(itemId);
    }

    if (
      item.itemState & ItemState.DOWNLOAD_PENDING ||
      item.itemState & ItemState.DOWNLOADING
    ) {
      this.watchItem(itemId);
    }

    if (
      item.itemState & ItemState.INSTALLED &&
      !(item.itemState & ItemState.DOWNLOAD_PENDING) &&
      !(item.itemState & ItemState.DOWNLOADING)
    ) {
      this.unwatchItem(itemId);
    }

    return item;
  }

  async loadSubscribedItems() {
    try {
      this.isLoading = true;
      const ids = await steamworksManager.getSubscribedIds();
      const res = await steamworksManager.getItems(ids);
      (await Promise.all(res.items.map(this.formatItem))).forEach((item) => {
        if (!item) return;
        this.subscribed.set(item.itemId, item);
        this.handelSubscribedItemStatus(item.itemId);
      });
      this.isReady = true;
      const items = await this.getLoadedSubscribedItems();
      broadcaster.broadcast("workshop:subscribed-loaded", items);
      return items;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  async loadSubscribedItem(itemId: bigint) {
    const item = await this.formatItem(await steamworksManager.getItem(itemId));
    if (!item) return;
    this.subscribed.set(item.itemId, item);
    this.handelSubscribedItemStatus(item.itemId);
    return item;
  }

  async getLoadedSubscribedItems() {
    return Array.from(this.subscribed.values());
  }

  async formatItem(x: WorkshopItem | undefined | null) {
    if (!x) return;

    const [downloadInfo, installInfo, itemState] = await Promise.all([
      steamworksManager.downloadInfo(x.publishedFileId),
      steamworksManager.installInfo(x.publishedFileId),
      steamworksManager.itemState(x.publishedFileId),
    ]);
    const x1 = x as unknown as WorkshopItem;
    const item: WorkshopExtendItem = {
      ...x1,
      itemId: x.publishedFileId,
      downloadInfo,
      installInfo,
      itemState,
    };
    return item;
  }

  async download(itemId: bigint) {
    try {
      await steamworksManager.download(itemId, false);
      this.watchItem(itemId);
    } catch (error) {
      console.error(error);
    }
  }

  async subscribe(itemId: bigint) {
    try {
      broadcaster.broadcast("workshop:before-subscribe", itemId);
      this.subscribing.add(itemId);
      await steamworksManager.subscribe(itemId);
      const item = await this.loadSubscribedItem(itemId);
      broadcaster.broadcast("workshop:subscribed", itemId, item);
    } catch (error) {
      console.error(error);
    } finally {
      this.subscribing.delete(itemId);
      broadcaster.broadcast("workshop:after-subscribe", itemId);
    }
  }

  async unsubscribe(itemId: bigint) {
    try {
      broadcaster.broadcast("workshop:before-unsubscribe", itemId);
      this.unsubscribing.add(itemId);
      await steamworksManager.unsubscribe(itemId);
      const item = this.subscribed.get(itemId);
      this.subscribed.delete(itemId);
      broadcaster.broadcast("workshop:unsubscribed", itemId, item);
    } catch (error) {
      console.error(error);
    } finally {
      this.unsubscribing.delete(itemId);
      broadcaster.broadcast("workshop:after-unsubscribe", itemId);
    }
  }

  getInstalledItems() {
    return Array.from(this.subscribed.values()).filter(
      (x) => x.installInfo?.folder
    );
  }

  isSubscribed(itemId: bigint) {
    return this.subscribed.has(itemId);
  }

  isSubscribing(itemId: bigint) {
    return this.subscribing.has(itemId);
  }

  isUnsubscribing(itemId: bigint) {
    return this.unsubscribing.has(itemId);
  }

  isDownloading(itemId: bigint) {
    const item = this.subscribed.get(itemId);
    return item && item.itemState & ItemState.DOWNLOADING;
  }

  static isTagsIntersect(itemTags?: string[], targetTags?: string[]): boolean {
    return (
      targetTags?.some((targetTag) =>
        itemTags?.some(
          (itemTag) => itemTag.toLocaleLowerCase() == targetTag.toLowerCase()
        )
      ) ?? false
    );
  }
}

export const workshopManager = MainWorkshopManager.instance;

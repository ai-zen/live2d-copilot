import EventBus from "@ai-zen/event-bus";
import type { Methods } from "live2d-copilot-main/src/windows/preloads/workshop";
import {
  ItemState,
  WorkshopExtendItem,
} from "live2d-copilot-shared/src/Steamworks";
import { reactive } from "vue";
import { broadcaster } from "./broadcaster";
import { rpc } from "./rpc";

export class RenderWorkshopManager {
  static instance = new RenderWorkshopManager();

  eventBus = new EventBus();

  workshopApi = rpc.use<Methods>("workshop");

  state = reactive({
    isSyncing: false,
    isReady: false,
    subscribed: new Map() as Map<bigint, WorkshopExtendItem>,
    subscribing: new Set() as Set<bigint>,
    unsubscribing: new Set() as Set<bigint>,
  });

  isSubscribed(itemId: bigint) {
    return this.state.subscribed.has(itemId);
  }

  isSubscribing(itemId: bigint) {
    return this.state.subscribing.has(itemId);
  }

  isUnsubscribing(itemId: bigint) {
    return this.state.unsubscribing.has(itemId);
  }

  isDownloading(itemId: bigint) {
    const item = this.state.subscribed.get(itemId);
    return item && item.itemState & ItemState.DOWNLOADING;
  }

  async syncSubscribedItems() {
    if (this.state.isSyncing) {
      return this.eventBus.promise("ready") as Promise<WorkshopExtendItem[]>;
    }
    try {
      this.state.isSyncing = true;
      const items = await this.workshopApi.getLoadedSubscribedItems();
      items.forEach((x) => {
        this.state.subscribed.set(x.itemId, x);
      });
      this.state.isReady = true;
      this.eventBus.emit("ready", items);
      return items;
    } finally {
      this.state.isSyncing = false;
    }
  }

  subscribe(itemId: bigint) {
    return this.workshopApi.subscribe(itemId);
  }

  unsubscribe(itemId: bigint) {
    return this.workshopApi.unsubscribe(itemId);
  }

  getInstalledItems() {
    return Array.from(this.state.subscribed.values()).filter(
      (x) => x.installInfo?.folder
    );
  }

  constructor() {
    broadcaster.on("workshop:before-subscribe", (itemId: bigint) => {
      this.state.subscribing.add(itemId);
    });

    broadcaster.on("workshop:after-subscribe", (itemId: bigint) => {
      this.state.subscribing.delete(itemId);
    });

    broadcaster.on("workshop:before-unsubscribe", (itemId: bigint) => {
      this.state.unsubscribing.add(itemId);
    });

    broadcaster.on("workshop:after-unsubscribe", (itemId: bigint) => {
      this.state.unsubscribing.delete(itemId);
    });

    broadcaster.on(
      "workshop:subscribed",
      (itemId: bigint, item: WorkshopExtendItem) => {
        this.state.subscribed.set(itemId, item);
      }
    );

    broadcaster.on("workshop:unsubscribed", (itemId: bigint) => {
      this.state.subscribed.delete(itemId);
    });

    broadcaster.on(
      "workshop:item-status-updated",
      (itemId: bigint, item: WorkshopExtendItem) => {
        this.state.subscribed.set(itemId, item);
      }
    );

    broadcaster.on("workshop:subscribed-loaded", () => {
      this.syncSubscribedItems();
    });

    this.syncSubscribedItems();
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

export const workshopManager = RenderWorkshopManager.instance;

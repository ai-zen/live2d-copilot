import steamworks, { Client } from "@ai-zen/steamworks.js";
import { workshop } from "@ai-zen/steamworks.js/client";
import {
  UGCQueryType,
  UGCType,
  UgcUpdate,
  UpdateProgress,
  WorkshopItemQueryConfig,
} from "live2d-copilot-shader/src/Steamworks";

export class SteamworksManager {
  APP_ID = 2570090;
  _client: Omit<Client, "init" | "runCallbacks"> | null = null;

  async init() {
    this._client = steamworks.init(this.APP_ID);
  }

  get client() {
    if (!this._client) {
      throw new Error("Steamworks Client not initialized.");
    }
    return this._client;
  }

  createItem() {
    return this.client.workshop.createItem();
  }

  updateItem(
    itemId: bigint,
    updateDetails: UgcUpdate,
    progressCallback: (data: UpdateProgress) => void,
    progressCallbackInterval: number
  ) {
    return new Promise<{
      itemId: bigint;
      needsToAcceptAgreement: boolean;
    }>((resolve, reject) => {
      this.client.workshop.updateItemWithCallback(
        itemId,
        updateDetails as workshop.UgcUpdate,
        undefined,
        resolve,
        reject,
        progressCallback as unknown as (data: workshop.UpdateProgress) => void,
        progressCallbackInterval
      );
    });
  }

  getAllItems(
    page: number,
    queryType: UGCQueryType,
    itemType: UGCType,
    queryConfig?: WorkshopItemQueryConfig
  ) {
    return this.client.workshop.getAllItems(
      page,
      queryType as unknown as workshop.UGCQueryType,
      itemType as unknown as workshop.UGCType,
      this.APP_ID,
      this.APP_ID,
      queryConfig as unknown as workshop.WorkshopItemQueryConfig
    );
  }

  getSubscribedItems() {
    return this.client.workshop.getSubscribedItems();
  }

  getItems(itemIds: bigint[], queryConfig?: WorkshopItemQueryConfig) {
    return this.client.workshop.getItems(itemIds, queryConfig);
  }

  getItem(itemId: bigint, queryConfig?: WorkshopItemQueryConfig) {
    return this.client.workshop.getItem(itemId, queryConfig);
  }

  subscribe(itemId: bigint) {
    return this.client.workshop.subscribe(itemId);
  }

  unsubscribe(itemId: bigint) {
    return this.client.workshop.unsubscribe(itemId);
  }

  download(itemId: bigint, highPriority: boolean) {
    return this.client.workshop.download(itemId, highPriority);
  }

  downloadInfo(itemId: bigint) {
    return this.client.workshop.downloadInfo(itemId);
  }
}

export const steamworksManager = new SteamworksManager();

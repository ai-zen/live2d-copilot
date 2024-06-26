import { init, Client } from "@ai-zen/steamworks.js";
import { workshop } from "@ai-zen/steamworks.js/client";
import { dialog } from "electron";
import {
  UGCQueryType,
  UGCType,
  UgcUpdate,
  UpdateProgress,
  WorkshopItem,
  WorkshopItemQueryConfig,
  WorkshopItemsResult,
  WorkshopPaginatedResult,
} from "live2d-copilot-shared/src/Steamworks";

export class SteamworksManager {
  static instance = new SteamworksManager();
  private constructor() {}

  APP_ID = 2570090; // You can change to 480, If you are not on the developer whitelist(Steam) for this project.
  _client: Omit<Client, "init" | "runCallbacks"> | null = null;

  async init() {
    try {
      this._client = init(this.APP_ID);
    } catch (error) {
      console.error("[steamworksManager.ts] init error", error);
      dialog.showMessageBox({
        type: "warning",
        message:
          "This project relies on Steam. Please start Steam first, otherwise some features may not work properly.",
      });
    }
  }

  get client() {
    if (!this._client) {
      throw new Error("Steamworks Client not initialized.");
    }
    return this._client;
  }

  async createItem() {
    return this.client.workshop.createItem();
  }

  async updateItem(
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

  async getAllItems(
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
    ) as unknown as Promise<WorkshopPaginatedResult>;
  }

  async getSubscribedIds() {
    return this.client.workshop.getSubscribedItems();
  }

  async getItems(itemIds: bigint[], queryConfig?: WorkshopItemQueryConfig) {
    return this.client.workshop.getItems(
      itemIds,
      queryConfig
    ) as unknown as Promise<WorkshopItemsResult>;
  }

  async getItem(itemId: bigint, queryConfig?: WorkshopItemQueryConfig) {
    return this.client.workshop.getItem(
      itemId,
      queryConfig
    ) as unknown as Promise<WorkshopItem>;
  }

  async subscribe(itemId: bigint) {
    return this.client.workshop.subscribe(itemId);
  }

  async unsubscribe(itemId: bigint) {
    return this.client.workshop.unsubscribe(itemId);
  }

  async download(itemId: bigint, highPriority: boolean) {
    return this.client.workshop.download(itemId, highPriority);
  }

  async downloadInfo(itemId: bigint) {
    return this.client.workshop.downloadInfo(itemId);
  }

  async installInfo(itemId: bigint) {
    return this.client.workshop.installInfo(itemId);
  }

  async itemState(itemId: bigint) {
    return this.client.workshop.state(itemId);
  }
}

export const steamworksManager = SteamworksManager.instance;

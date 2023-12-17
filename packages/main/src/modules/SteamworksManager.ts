import { UpdateStatus } from "live2d-copilot-shader/src/Steamworks";
import steamworks, { Client } from "@ai-zen/steamworks.js";
import { workshop } from "@ai-zen/steamworks.js/client";

export class SteamworksManager {
  client: Omit<Client, "init" | "runCallbacks"> | null = null;
  async init() {
    this.client = steamworks.init(2570090);
  }

  async createItem() {
    if (!this.client)
      throw new Error(
        "Failed to create item: Steamworks Client not initialized."
      );
    try {
      return await this.client.workshop.createItem();
    } catch (error: any) {
      throw new Error(`Failed to create item: ${error?.message}`);
    }
  }

  updateItem(
    itemId: bigint,
    updateDetails: workshop.UgcUpdate,
    progressCallback: (data: {
      status: UpdateStatus;
      progress: bigint;
      total: bigint;
    }) => void
  ) {
    return new Promise<{
      itemId: bigint;
      needsToAcceptAgreement: boolean;
    }>((resolve, reject) => {
      if (!this.client) {
        reject(
          new Error("Failed to update item: Steamworks Client not initialized.")
        );
        return;
      }
      this.client.workshop.updateItemWithCallback(
        itemId,
        updateDetails,
        undefined,
        resolve,
        reject,
        progressCallback
      );
    });
  }
}

export const steamworksManager = new SteamworksManager();

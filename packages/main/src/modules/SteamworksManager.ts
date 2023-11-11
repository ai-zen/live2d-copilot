import steamworks, { Client } from "steamworks.js";
import { workshop } from "steamworks.js/client";

export class SteamworksManager {
  client: Omit<Client, "init" | "runCallbacks"> | null = null;
  async init() {
    this.client = steamworks.init(2570090);
  }

  async createItem(updateDetails: workshop.UgcUpdate) {
    if (!this.client) return;
    try {
      const item = await this.client.workshop.createItem();
      const result = await this.client.workshop.updateItem(
        item.itemId,
        updateDetails
      );
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to create item", { cause: error });
    }
  }

  async updateItem(itemId: bigint, updateDetails: workshop.UgcUpdate) {
    if (!this.client) return;
    try {
      const result = await this.client.workshop.updateItem(
        itemId,
        updateDetails
      );
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to update item", { cause: error });
    }
  }
}

export const steamworksManager = new SteamworksManager();

import EventBus from "@ai-zen/event-bus";
import { app } from "electron";
import { Setting } from "live2d-copilot-shared/src/Setting";
import fsp from "node:fs/promises";
import path from "node:path";
import { broadcaster } from "./broadcaster";

export class MainSettingManager {
  static instance = new MainSettingManager();
  private constructor() {}

  SETTING_PATH = path.join(app.getPath("userData"), "setting.json");

  isLoading = false; // Whether the setting file is currently being loaded
  isSaving = false; // Whether the setting file is currently being saved
  isReady = false; // Whether the setting file is ready for use
  data = <Setting>{
    lang: "en", // Default language
    alwaysOnTop: true,
  };

  eventBus = new EventBus(); // Event bus for notifying state changes

  init() {
    try {
      return this.loadSetting();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Load the setting data
   */
  async loadSetting() {
    try {
      this.isLoading = true; // Set isLoading status to true
      const data = await fsp
        .readFile(this.SETTING_PATH, { encoding: "utf-8" }) // Read the setting file
        .then(JSON.parse); // Parse the setting file content as JSON
      Object.assign(this.data, data); // Merge setting data.
    } catch (error) {
      console.warn("[MainSettingManager] Failed to load setting file.", error); // Log an error message if the setting file fails to load
    } finally {
      // Default settings will be used even if failed to load.
      this.isReady = true; // Set isReady status to true
      this.eventBus.emit("ready"); // Emit an event signaling that the setting state is ready
      this.isLoading = false; // Set isLoading status to false
    }
  }

  /**
   * Save the setting data
   */
  async saveSetting() {
    try {
      this.isSaving = true; // Set isSaving status to true
      await fsp.writeFile(this.SETTING_PATH, JSON.stringify(this.data), {
        encoding: "utf-8",
      }); // Write the setting file with the updated data
    } catch (error) {
      console.warn("[MainSettingManager] Failed to save setting file.", error); // Log an error message if the setting file fails to save
    } finally {
      this.isSaving = false; // Set isSaving status to false
    }
  }

  /**
   * Get the setting data
   */
  async getSetting() {
    // Check if the setting state is loading
    if (this.isLoading) {
      // Wait for the setting state to be loaded
      await this.eventBus.promise("ready");
    }

    // console.log("[settingManager.ts] getSetting", this.data);

    // Return the setting state data
    return this.data;
  }

  /**
   * Set the setting data and emit the change event.
   */
  setSetting(data: Setting) {
    console.log("[settingManager.ts] setSetting", data);

    // Set the setting data
    this.data = data;

    // Emit the change event.
    this.eventBus.emit("change", data);

    // Broadcast the change event to all windows.
    broadcaster.broadcast("setting:change", data);

    // save the setting
    return this.saveSetting();
  }
}

export const settingManager = MainSettingManager.instance;

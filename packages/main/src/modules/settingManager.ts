import EventBus from "@ai-zen/event-bus";
import { app } from "electron";
import fsp from "node:fs/promises";
import path from "node:path";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";
import {
  Setting,
  SettingMethodsByRender,
} from "live2d-copilot-shared/src/Setting";

export class SettingManager {
  static instance = new SettingManager();
  private constructor() {}

  SETTING_PATH = path.join(app.getPath("userData"), "setting.json");

  settingState = {
    isLoading: false, // Whether the setting file is currently being loaded
    isSaving: false, // Whether the setting file is currently being saved
    isReady: false, // Whether the setting file is ready for use
    data: {
      lang: "en", // Default language
      alwaysOnTop: true,
    } as Setting,
  };

  eventBus = new EventBus(); // Event bus for notifying state changes

  /**
   * Load the setting data
   */
  async loadSetting() {
    try {
      this.settingState.isLoading = true; // Set isLoading status to true
      const data = await fsp
        .readFile(this.SETTING_PATH, { encoding: "utf-8" }) // Read the setting file
        .then(JSON.parse); // Parse the setting file content as JSON
      Object.assign(this.settingState.data, data); // Merge setting data.
    } catch (error) {
      console.warn("[SettingManager] Failed to load setting file.", error); // Log an error message if the setting file fails to load
    } finally {
      // Default settings will be used even if failed to load.
      this.settingState.isReady = true; // Set isReady status to true
      this.eventBus.emit("setting state ready"); // Emit an event signaling that the setting state is ready
      this.settingState.isLoading = false; // Set isLoading status to false
    }
  }

  /**
   * Save the setting data
   */
  async saveSetting() {
    try {
      this.settingState.isSaving = true; // Set isSaving status to true
      await fsp.writeFile(
        this.SETTING_PATH,
        JSON.stringify(this.settingState.data),
        { encoding: "utf-8" }
      ); // Write the setting file with the updated data
    } catch (error) {
      console.warn("[SettingManager] Failed to save setting file.", error); // Log an error message if the setting file fails to save
    } finally {
      this.settingState.isSaving = false; // Set isSaving status to false
    }
  }

  /**
   * Get the setting data
   */
  async getSetting() {
    // Check if the setting state is loading
    if (this.settingState.isLoading) {
      // Wait for the setting state to be loaded
      await this.eventBus.promise("ready");
    }

    // console.log("[settingManager.ts] getSetting", this.settingState.data);

    // Return the setting state data
    return this.settingState.data;
  }

  /**
   * Set the setting data and emit the change event.
   */
  setSetting(data: Setting) {
    console.log("[settingManager.ts] setSetting", data);

    // Set the setting data
    this.settingState.data = data;
    // Emit the change event.
    this.eventBus.emit("change", data);

    // Emit setting change event to all windows.
    BrowserWindowEx.instanceMap.forEach((win) => {
      // If the window has register `getSetting` method.
      // Only the registered getSetting method allows the window to read the settings content.
      if (win.rpc.callMap.has("setting:getSetting")) {
        // Emit change event to the window.
        win.rpc.use<SettingMethodsByRender>("setting").onSettingChange(data);
      }
    });

    // save the setting
    return this.saveSetting();
  }
}

export const settingManager = SettingManager.instance;

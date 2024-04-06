import EventBus from "@ai-zen/event-bus";
import { app } from "electron";
import fsp from "fs/promises";
import type {
  Live2DModelManagerConfig,
  Live2DModelPathInfo,
  Live2DModelProfileEx,
  Live2DModelProfileV1,
} from "live2d-copilot-shared/src/Live2DModels";
import path from "path";
import { copyFolder } from "../utils/fs";
import { broadcaster } from "./broadcaster";

export class Live2DModelsManager {
  static instance = new Live2DModelsManager();
  private constructor() {}

  MODELS_DIR = path.join(app.getPath("userData"), "Live2D Models"); // Directory to store Live2D models
  CONFIG_PATH = path.join(this.MODELS_DIR, "config.json"); // Path to the config file storing Live2D model information
  DEFAULT_MODEL3 = path.resolve(this.MODELS_DIR, "./Mao/Mao.model3.json");

  configState = {
    isLoading: false, // Whether the config file is currently being loaded
    isSaving: false, // Whether the config file is currently being saved
    isReady: false, // Whether the config file is ready for use
    data: {
      current: this.DEFAULT_MODEL3, // Default value for the current Live2D model
    } as Live2DModelManagerConfig,
  };

  eventBus = new EventBus(); // Event bus for notifying state changes

  async loadConfig() {
    try {
      this.configState.isLoading = true; // Set isLoading status to true
      this.configState.data = await fsp
        .readFile(this.CONFIG_PATH, { encoding: "utf-8" }) // Read the config file
        .then(JSON.parse); // Parse the config file content as JSON
    } catch (error) {
      console.warn("[Live2DModelManager] Failed to load config file.", error); // Log an error message if the config file fails to load
    } finally {
      this.configState.isReady = true; // Set isReady status to true
      this.eventBus.emit("config state ready"); // Emit an event signaling that the config state is ready
      this.configState.isLoading = false; // Set isLoading status to false
    }
  }

  async saveConfig() {
    try {
      this.configState.isSaving = true; // Set isSaving status to true
      await fsp.writeFile(
        this.CONFIG_PATH,
        JSON.stringify(this.configState.data),
        { encoding: "utf-8" }
      ); // Write the config file with the updated data
    } catch (error) {
      console.warn("[Live2DModelManager] Failed to save config file.", error); // Log an error message if the config file fails to save
    } finally {
      this.configState.isSaving = false; // Set isSaving status to false
    }
  }

  async loadProfiles() {
    const files = await fsp.readdir(this.MODELS_DIR); // Read the models directory

    const profiles: Live2DModelProfileEx[] = [];

    await Promise.all(
      files.map(async (file) => {
        const modelDir = path.join(this.MODELS_DIR, file); // Get the directory path for each file
        try {
          const stat = await fsp.stat(modelDir); // Get the file stats
          if (stat.isDirectory()) {
            const profile = await this.loadProfile(modelDir); // Load the profile for the model directory
            if (profile) profiles.push(profile); // Push the profile to the array if it exists
          }
        } catch (error) {
          return undefined;
        }
      })
    );

    return profiles; // Return the profiles array
  }

  async loadProfile(modelDir: string) {
    try {
      const profilePath = path.join(modelDir, "profile.json"); // Construct the path to the profile file
      const profile = await fsp
        .readFile(profilePath, { encoding: "utf-8" }) // Read the profile file
        .then(JSON.parse); // Parse the profile file content as JSON
      const profileEx: Live2DModelProfileEx = {
        ...profile,
        _modelDir: modelDir,
        _modelFileName: profile.model3,
        _modelName: profile.model3.replace(".model3.json", ""), // Remove the file extension from the model name
        _modelPath: path.join(modelDir, profile.model3),
      };
      return profileEx; // Return the extended profile
    } catch (error) {
      console.error(`Failed to load Live2DModelProfile:\n${error}`); // Log an error message if the profile fails to load
    }
  }

  async saveProfile(modelDir: string, profile: Live2DModelProfileV1) {
    try {
      const profilePath = path.join(modelDir, "profile.json"); // Construct the path to the profile file
      await fsp.writeFile(profilePath, JSON.stringify(profile, null, 4), {
        encoding: "utf-8",
      }); // Write the profile file with the updated data
    } catch (error) {
      console.error(`Failed to save Live2DModelProfile:\n${error}`); // Log an error message if the profile fails to save
    }
  }

  async getCurrent(): Promise<Live2DModelPathInfo | null> {
    if (!this.configState.isReady)
      await this.eventBus.promise("config state ready"); // Wait for the config state to be ready before continuing
    let { current } = this.configState.data; // Get the path to the current Live2D model from the config state
    if (!current) current = this.DEFAULT_MODEL3; // If no current model is set, use the default model path
    try {
      const stat = await fsp.stat(current); // Get the file stats for the current Live2D model
      if (!stat.isFile()) throw new Error(`"${current}" is not a file.`); // Throw an error if the current Live2D model is not a file
      return this.parseModel3Path(current); // Parse the path to the current Live2D model and return the result
    } catch (error) {
      return null; // Return null if the current Live2D model fails to load
    }
  }

  async setCurrent(model3: string) {
    // Set the config data
    this.configState.data.current = model3;
    await this.saveConfig();

    // Emit the change event.
    this.eventBus.emit("current-model-change", model3);

    // Broadcast the change event to all windows.
    broadcaster.broadcast("live2d-models:current-model-change", model3);
  }

  async getCurrentProfile(): Promise<Live2DModelProfileEx | null> {
    const pathInfo = await this.getCurrent();
    if (!pathInfo) return null;
    const profile = await this.loadProfile(pathInfo.modelDir);
    return profile ?? null;
  }

  parseModel3Path(model3: string): Live2DModelPathInfo {
    return {
      modelName: path.basename(model3, ".model3.json"), // Get the model name from the file name by removing the file extension
      modelDir: path.resolve(model3, "../"), // Get the directory of the model by resolving the parent directory
      modelFileName: path.basename(model3), // Get the file name of the model
      modelPath: path.normalize(model3), // Normalize the path to the model file
    };
  }

  async releaseFilesToUserData() {
    console.log("[Live2DModelsManager] Release Files To UserData");
    const modelsSource = path.resolve(__dirname, "./toUserData/Live2D Models"); // Get the source directory for the models to be released
    const modelsTarget = path.resolve(this.MODELS_DIR); // Get the target directory for releasing the models to user data
    await copyFolder(modelsSource, modelsTarget, { overwrite: false }); // Copy the models source directory to the models target directory, avoiding overwriting existing files
  }
}

export const live2dModelsManager = Live2DModelsManager.instance; // Create a singleton instance of Live2DModelsManager

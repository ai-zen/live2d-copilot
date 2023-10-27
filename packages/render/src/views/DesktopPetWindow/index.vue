<template>
  <Live2D class="live2d" @mounted="onLive2DMounted" ref="live2dRef" />
</template>

<script setup lang="ts">
import {
  Live2D,
  LAppDelegateModule,
  LAppLive2DManagerModule,
  LAppProfileModule,
} from "@ai-zen/live2d-vue";
import { ref } from "vue";
import type { CallRecord } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { rpc } from "../../modules/rpc";
import { toLocalURI } from "../../utils/toLocalURI";
import { useWindowMove } from "../../composables/useWindowMove";

const winApi = rpc.use<CallRecord>("desktop-pet-window");

const live2dRef = ref<null | InstanceType<typeof Live2D>>();

let currentModel = null; // The current Live2D model
const currentModelProfile = ref<LAppProfileModule.LAppProfile | null>(null); // The profile of the current Live2D model
let currentManager: LAppLive2DManagerModule.LAppLive2DManager | null = null; // The manager for controlling Live2D models

async function onLive2DMounted(
  _delegate: LAppDelegateModule.LAppDelegate,
  manager: LAppLive2DManagerModule.LAppLive2DManager
) {
  currentManager = manager;

  loadCurrentModel(); // Load the current Live2D model

  winApi.closeLoadingWindow(); // Close the loading window
}

async function loadCurrentModel() {
  if (!currentManager) return;

  let pathInfo = await winApi.getCurrentLive2DModel(); // Get the path information for the current Live2D model
  if (!pathInfo) return;

  currentModel = await currentManager.changeModel(
    toLocalURI(pathInfo.modelDir), // Convert the model directory path to a local URI
    pathInfo.modelFileName // Get the file name of the Live2D model
  );

  // After loading the model, receive the character profile configuration (if any)
  currentModelProfile.value = await currentModel._profileManager.loadProfile();
}

useWindowMove(winApi); // Enable window movement
</script>

<style lang="scss" scoped>
.live2d {
  width: 100%;
  height: 100%;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>

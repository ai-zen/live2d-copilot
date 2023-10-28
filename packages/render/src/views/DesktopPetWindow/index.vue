<template>
  <Live2D class="live2d" @mounted="onLive2DMounted" ref="live2dRef" />
</template>

<script setup lang="ts">
import {
  Live2D,
  LAppDelegateModule,
  LAppLive2DManagerModule,
} from "@ai-zen/live2d-vue";
import { ref, shallowRef } from "vue";
import type { CallRecord } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { rpc } from "../../modules/rpc";
import { useCurrentModel } from "./composables/useCurrentModel";

type LAppLive2DManager = LAppLive2DManagerModule.LAppLive2DManager;
type LAppDelegate = LAppDelegateModule.LAppDelegate;

const winApi = rpc.use<CallRecord>("desktop-pet-window");
const live2dRef = ref<null | InstanceType<typeof Live2D>>();
const managerRef = shallowRef<LAppLive2DManager | null>(null);
const delegateRef = shallowRef<LAppDelegate | null>(null);

const { loadCurrentModel } = useCurrentModel({
  winApi,
  managerRef,
});

async function onLive2DMounted(
  delegate: LAppDelegate,
  manager: LAppLive2DManager
) {
  managerRef.value = manager;
  delegateRef.value = delegate;
  await loadCurrentModel(); // Load the current Live2D model
  winApi.closeLoadingWindow(); // Close the loading window
}
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

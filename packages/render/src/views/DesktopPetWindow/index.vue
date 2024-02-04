<template>
  <Live2D class="live2d" @mounted="onLive2DMounted" ref="live2dRef" />
  <Subtitles
    v-if="profileRef && positionRef"
    :model-position="positionRef"
    v-model:transform="profileRef.SubtitlesTransform"
    @update:transform="saveProfileWithDebounce"
    ref="subtitlesRef"
  />
  <ChatInput
    v-if="profileRef && positionRef"
    :model-position="positionRef"
    v-model:transform="profileRef.ChatInputTransform"
    @update:transform="saveProfileWithDebounce"
    :chatContext="chatContext"
    ref="chatInputRef"
  />
  <ContextMenu />
</template>

<script setup lang="ts">
import {
  LAppDelegateModule,
  LAppLive2DManagerModule,
  Live2D,
} from "@ai-zen/live2d-vue";
import type { Methods } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { ref, shallowRef, watch } from "vue";
import { rpc } from "../../modules/rpc";
import ChatInput from "./ChatInput.vue";
import ContextMenu from "./ContextMenu.vue";
import Subtitles from "./Subtitles.vue";
import { useChat } from "./composables/useChat";
import { useCurrentModel } from "./composables/useCurrentModel";
import { useSentence } from "./composables/useSentence";
import { useTTS } from "./composables/useTTS";
import { sleep, waitAudioEnd } from "../../utils/sleep";

type LAppLive2DManager = LAppLive2DManagerModule.LAppLive2DManager;
type LAppDelegate = LAppDelegateModule.LAppDelegate;

const winApi = rpc.use<Methods>("desktop-pet-window");
const live2dRef = ref<null | InstanceType<typeof Live2D>>();
const managerRef = shallowRef<LAppLive2DManager | null>(null);
const delegateRef = shallowRef<LAppDelegate | null>(null);
const subtitlesRef = ref<null | InstanceType<typeof Subtitles>>(null);
const chatInputRef = ref<null | InstanceType<typeof ChatInput>>(null);

const {
  loadCurrentModel,
  currentModelPositionRef: positionRef,
  currentModelProfileRef: profileRef,
  saveProfileWithDebounce,
} = useCurrentModel({
  winApi,
  managerRef,
  delegateRef,
});

async function onLive2DMounted(
  delegate: LAppDelegate,
  manager: LAppLive2DManager
) {
  managerRef.value = manager;
  delegateRef.value = delegate;
  manager._enabledDrag = false;
  await loadCurrentModel(); // Load the current Live2D model
  winApi.closeLoadingWindow(); // Close the loading window
}

rpc.register("desktop-pet-window", {
  async onCurrentModelChange() {
    await loadCurrentModel(); // Load the current Live2D model
  },
});

const chatContext = useChat({
  onDeltaContent(delta_content) {
    sentenceContext.inputQueue.push(delta_content);
  },
  onFinally() {
    sentenceContext.inputQueue.push(null);
    // The `null` indicates that the request has ended,
    // and even if no punctuation marks are matched,
    // the sentence will be output.
  },
});

const sentenceContext = useSentence();

const ttsContext = useTTS();

(async function () {
  for await (const sentence of sentenceContext.outputQueue) {
    ttsContext.inputQueue.push(sentence.text);
  }
})();

(async function () {
  for await (const voice of ttsContext.outputQueue) {
    subtitlesRef.value?.push(voice.text);
    if (voice.audio) await waitAudioEnd(voice.audio);
    if (!ttsContext.outputQueue.size) {
      if (!voice.audio) await sleep(3000);
      subtitlesRef.value?.clear();
    }
  }
})();

watch(
  () => profileRef.value?.Chat?.Prompt,
  (currentModelPrompt) => {
    chatContext.abort();
    chatContext.init();
    if (currentModelPrompt) {
      chatContext.chatState.messages.push(
        chatContext.createSystemMessage(currentModelPrompt)
      );
    }
  }
);
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

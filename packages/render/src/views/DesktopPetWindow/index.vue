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
    @send="sendMessage"
    ref="chatInputRef"
  />
  <ContextMenu />
</template>

<script setup lang="ts">
import { ChatAL } from "@ai-zen/chats-core";
import {
  LAppDefineModule,
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
import { useVoicePlay } from "./composables/useVoicePlay";

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
  currentModelRef,
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

const chatController = useChat({
  onDeltaContent(deltaContent) {
    sentenceController.inputQueue.push(deltaContent);
  },
  onParsed() {
    sentenceController.inputQueue.push(null); // Push null to end the sentence
  },
});

const sentenceController = useSentence({
  onSentence({ text }) {
    ttsController.inputQueue.push(text);
  },
});

const ttsController = useTTS({
  onVoice(voice) {
    voicePlayController.inputQueue.push(voice);
  },
});

const voicePlayController = useVoicePlay({
  onPlay(voice) {
    // 显示字幕
    subtitlesRef.value?.push(voice.text, voice.audio!.duration * 1000 ?? 1000);
    // 模型相关操作
    if (currentModelRef.value) {
      // 启动模型的闲置动作
      currentModelRef.value.startMotion(
        "Idle",
        0,
        LAppDefineModule.PriorityForce
      );
      // 对口型
      currentModelRef.value._wavFileHandler.start(voice.audio!.src);
      // 停用模型的随机动作
      currentModelRef.value._enabledRandomIdleMotion = false;
    }
  },
  onPlayed() {
    // 如果播放结束后没有更多音频
    if (!voicePlayController.inputQueue.size) {
      // 模型相关操作
      if (currentModelRef.value) {
        // 重新启用随机动画
        currentModelRef.value._enabledRandomIdleMotion = true;
      }
    }
  },
});

function sendMessage(content: string) {
  console.log("sendMessage", content);
  chatController.send(content);
}

watch(
  () => profileRef.value?.Chat?.Prompt,
  (prompt) => {
    chatController.abort();
    chatController.init();
    if (prompt) {
      chatController.setMessages([
        { role: ChatAL.Role.System, content: prompt },
      ]);
    }
  },
  {
    immediate: true,
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

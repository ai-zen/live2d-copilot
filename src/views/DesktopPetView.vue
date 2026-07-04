<script setup lang="ts">
import { Live2D } from "@ai-zen/live2d-vue";
import { invoke } from "@tauri-apps/api/core";
import { computed, ref } from "vue";
import ChatBubble from "../components/ChatBubble.vue";
import ChatInput from "../components/ChatInput.vue";
import ChatSettings from "../components/ChatSettings.vue";
import { useLive2D } from "../composables/useLive2D";
import { useDrag } from "../composables/useDrag";
import { useChat, PRESET_MODELS, type Provider } from "../composables/useChat";
import { useSentence } from "../composables/useSentence";
import { useTTS } from "../composables/useTTS";
import { useSpeaker } from "../composables/useSpeaker";

// ---- 管道串联 (Stage 1 → 2 → 3 → 4) ----

const speaker = useSpeaker();

const tts = useTTS({
  onVoice(clip) {
    speaker.inputQueue.push(clip);
  },
  onEnd() {
    speaker.inputQueue.push(null);
  },
});

const splitter = useSentence({
  onSentence(text) {
    tts.inputQueue.push(text);
  },
  onEnd() {
    tts.inputQueue.push(null);
  },
});

const chat = useChat({
  onDelta(delta) {
    splitter.inputQueue.push(delta);
  },
  onParsed() {
    splitter.inputQueue.push(null);
  },
});

// ---- Live2D 初始化 ----

const live2d = useLive2D();
useDrag();

const live2dRef = ref<InstanceType<typeof Live2D>>();

async function onLive2DReady() {
  const component = live2dRef.value as any;
  const manager = component?.managerRef;
  live2d.delegate.value = component?.delegateRef;
  if (manager) manager._enabledDrag = false;
  await live2d.load(manager, "/models/Mao", "Mao.model3.json");
  live2d.startGazeTracking();
}

// ---- 发送消息 ----

function send(text: string) {
  showBubble.value = true;
  chat.send(text);
}

function initSession() {
  const key = localStorage.getItem("llm_api_key") || "";
  const prov = (localStorage.getItem("llm_provider") || "deepseek") as Provider;
  const mid = localStorage.getItem("llm_model") || PRESET_MODELS[prov][0].id;
  if (!key) return;
  const model = PRESET_MODELS[prov].find((m) => m.id === mid);
  if (model) chat.init(prov, key, model.modelName);
}

// ---- UI 状态 ----

const showChat = ref(false);
const showBubble = ref(false);
const showSettings = ref(false);

const bubbleVisible = computed(() => showBubble.value && (chat.isRunning.value || speaker.state.isSpeaking));
const bubbleLoading = computed(() => chat.isRunning.value && !speaker.state.isSpeaking);

// ---- 右键菜单 ----

const menu = ref<{ items: { label: string; action: () => void }[]; x: number; y: number } | null>(null);

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  const items: { label: string; action: () => void }[] = [];
  items.push({ label: "⚙️ 设置", action: () => { showSettings.value = true; } });
  if (localStorage.getItem("llm_api_key")) {
    items.push({ label: showChat.value ? "关闭聊天" : "聊天", action: () => { showChat.value = !showChat.value; } });
  }
  menu.value = { items, x: e.clientX, y: e.clientY };
  setTimeout(() => { menu.value = null; }, 3000);
}

// ---- 启动 ----

invoke("close_loading_window");
initSession();
</script>

<template>
  <div class="desktop-pet-container" @contextmenu="onContextMenu">
    <Live2D ref="live2dRef" class="live2d-canvas" model-dir="" model-name="" @ready="onLive2DReady" />

    <ChatBubble
      :visible="bubbleVisible"
      :text="speaker.state.subtitle"
      :loading="bubbleLoading"
      @close="showBubble = false"
    />

    <ChatInput v-model:visible="showChat" @send="send" />

    <div v-if="menu" class="ctx-menu" :style="{ left: menu.x + 'px', top: menu.y + 'px' }" @click.stop>
      <div v-for="(item, i) in menu.items" :key="i" class="ctx-menu-item" @click="item.action(); menu = null">
        {{ item.label }}
      </div>
    </div>

    <ChatSettings v-if="showSettings" @close="showSettings = false" @saved="initSession" />
  </div>
</template>

<style scoped>
.desktop-pet-container { width: 100%; height: 100vh; position: relative; overflow: hidden; background: transparent; }
.live2d-canvas { width: 100%; height: 100%; cursor: grab; }
.live2d-canvas:active { cursor: grabbing; }
.ctx-menu { position: fixed; background: rgba(30,30,46,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 4px; z-index: 200; pointer-events: auto; min-width: 120px; }
.ctx-menu-item { padding: 8px 12px; color: #ccc; cursor: pointer; border-radius: 4px; font-size: 13px; }
.ctx-menu-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
</style>

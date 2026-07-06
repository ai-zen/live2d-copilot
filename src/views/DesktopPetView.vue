<script setup lang="ts">
import { Live2D } from "@ai-zen/live2d-vue";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { computed, ref, onMounted } from "vue";
import { Setting, ChatDotRound, Link, Monitor, SwitchButton, CloseBold } from "@element-plus/icons-vue";
import ChatBubble from "../components/ChatBubble.vue";
import ChatInput from "../components/ChatInput.vue";
import ContextMenu, { type MenuItem } from "../components/ContextMenu.vue";
import { useLive2D } from "../composables/useLive2D";
import { useDrag } from "../composables/useDrag";
import { useChat, PRESET_MODELS, type Provider } from "../composables/useChat";
import { useSentence } from "../composables/useSentence";
import { useTTS } from "../composables/useTTS";
import { useSpeaker } from "../composables/useSpeaker";
import type { AppSettings } from "../shared/Setting";

// ---- 设置缓存 ----

const settings = ref<AppSettings>({
  llm_api_key: "",
  llm_provider: "deepseek",
  llm_model: "",
  tts_voice: "zh-CN-XiaoxiaoNeural",
});

listen("settings-updated", (event) => {
  settings.value = event.payload as AppSettings;
});

// ---- Live2D 初始化 ----

const live2d = useLive2D();
useDrag();

// ---- 管道串联 (Stage 1 → 2 → 3 → 4) ----

const speaker = useSpeaker({
  onPlay(clip) {
    const model = live2d.model.value as any;
    if (model) {
      model._enabledVoicePlay = true;
      model._wavFileHandler.start(clip.blobUrl);
    }
  },
  onPlayed() {
    if (!(speaker.inputQueue as any).size) {
      const model = live2d.model.value as any;
      if (model) {
        model._enabledRandomIdleMotion = true;
      }
    }
  },
});

const tts = useTTS({
  getVoiceName: () => settings.value.tts_voice || "zh-CN-XiaoxiaoNeural",
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
  const key = settings.value.llm_api_key;
  if (!key) return;
  const prov = settings.value.llm_provider as Provider;
  const mid = settings.value.llm_model || PRESET_MODELS[prov][0].id;
  const model = PRESET_MODELS[prov].find((m) => m.id === mid);
  if (model) chat.init(prov, key, model.modelName);
}

// ---- UI 状态 ----

const showChat = ref(false);
const showBubble = ref(false);

const bubbleVisible = computed(() => showBubble.value && (chat.isRunning.value || speaker.state.isSpeaking));
const bubbleLoading = computed(() => chat.isRunning.value && !speaker.state.isSpeaking);

// ---- 右键菜单 ----

const menu = ref<{ items: MenuItem[]; x: number; y: number } | null>(null);

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  menu.value = {
    x: e.clientX,
    y: e.clientY,
    items: [
      { label: "模型", icon: Monitor, action: () => invoke("open_models_window") },
      { label: "插件", icon: Link, action: () => invoke("open_plugins_window") },
      { label: "聊天", icon: ChatDotRound, action: () => { if (!settings.value.llm_api_key) { invoke("open_settings_window", { prompt: "请先配置 API Key" }); } else { showChat.value = !showChat.value; } } },
      { label: "设置", icon: Setting, action: () => invoke("open_settings_window") },
      { label: "退出", icon: SwitchButton, action: () => invoke("quit_app") },
      { type: "close", label: "关闭", icon: CloseBold },
    ],
  };
}

// ---- 暗黑模式 ----

onMounted(() => {
  document.documentElement.classList.add("dark");
});

// ---- 启动 ----

(async () => {
  const s = await invoke<AppSettings>("load_setting");
  settings.value = s;
  invoke("close_loading_window");
  initSession();
})();
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

    <ContextMenu
      v-if="menu"
      :items="menu.items"
      :x="menu.x"
      :y="menu.y"
      @close="menu = null"
    />
  </div>
</template>

<style scoped>
.desktop-pet-container { width: 100%; height: 100vh; position: relative; overflow: hidden; background: transparent; }
.live2d-canvas { width: 100%; height: 100%; cursor: grab; }
.live2d-canvas:active { cursor: grabbing; }
</style>

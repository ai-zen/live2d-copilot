<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { PRESET_MODELS, type Provider } from "../composables/useChat";
import { listVoices, type TTSVoice } from "../utils/tts";
import type { AppSettings } from "../shared/Setting";

// ---- LLM 设置 ----
const apiKey = ref("");
const provider = ref<Provider>("deepseek");
const modelId = ref("");

const providers: { key: Provider; name: string }[] = [
  { key: "deepseek", name: "DeepSeek" },
  { key: "chatglm", name: "ChatGLM (智谱)" },
];

const models = ref<{ id: string; name: string }[]>([]);

function updateModels() {
  models.value = [...PRESET_MODELS[provider.value]];
  if (!models.value.find((m) => m.id === modelId.value)) {
    modelId.value = models.value[0]?.id || "";
  }
}

// ---- TTS 设置 ----
const voiceName = ref("");
const voices = ref<TTSVoice[]>([]);

async function loadVoices() {
  try {
    voices.value = await listVoices();
  } catch (e) {
    console.error("[settings] failed to load voices:", e);
  }
}

// ---- 保存 ----
const saved = ref(false);

async function save() {
  const s: AppSettings = {
    llm_api_key: apiKey.value.trim(),
    llm_provider: provider.value,
    llm_model: modelId.value,
    tts_voice: voiceName.value,
  };
  await invoke("save_setting", { settings: s });
  saved.value = true;
  setTimeout(() => (saved.value = false), 2000);
}

onMounted(async () => {
  const s = await invoke<AppSettings>("load_setting");
  apiKey.value = s.llm_api_key;
  provider.value = s.llm_provider as Provider;
  updateModels();
  modelId.value = s.llm_model || models.value[0]?.id || "";
  await loadVoices();
  voiceName.value = s.tts_voice;
});
</script>

<template>
  <div class="settings-window">
    <h2>⚙️ 设置</h2>

    <div class="section">
      <h3>🤖 AI 模型</h3>

      <label>提供商</label>
      <select v-model="provider" @change="updateModels">
        <option v-for="p in providers" :key="p.key" :value="p.key">{{ p.name }}</option>
      </select>

      <label>API Key</label>
      <input v-model="apiKey" type="password" placeholder="sk-..." />

      <label>模型</label>
      <select v-model="modelId">
        <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>

    <div class="section">
      <h3>🔊 TTS 语音</h3>

      <label>语音</label>
      <select v-model="voiceName">
        <option value="">zh-CN-XiaoxiaoNeural（默认）</option>
        <option v-for="v in voices" :key="v.ShortName" :value="v.ShortName">
          {{ v.FriendlyName }} ({{ v.Gender }})
        </option>
      </select>
    </div>

    <div class="actions">
      <span v-if="saved" class="saved-hint">✅ 已保存</span>
      <button class="btn-save" @click="save">保存设置</button>
    </div>
  </div>
</template>

<style scoped>
.settings-window {
  padding: 28px;
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  color: #ccc;
  background: #1a1a2e;
}
h2 { color: #fff; margin: 0 0 24px; font-size: 18px; }
h3 { color: #ddd; font-size: 14px; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.section { margin-bottom: 8px; }
label { font-size: 12px; color: #888; display: block; margin-top: 12px; margin-bottom: 4px; }
input, select {
  width: 100%;
  background: #22223a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 9px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
input:focus, select:focus { border-color: #4a9eff; }

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.saved-hint { font-size: 13px; color: #5c5; }
.btn-save {
  padding: 9px 24px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  cursor: pointer;
  background: #4a9eff;
  color: #fff;
}
.btn-save:hover { background: #3a8eee; }
</style>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { PRESET_MODELS, type Provider } from "../composables/useChat";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const apiKey = ref("");
const provider = ref<Provider>("deepseek");
const modelId = ref("");
const voiceName = ref("");
const voices = ref<SpeechSynthesisVoice[]>([]);

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

function loadVoices() {
  voices.value = speechSynthesis.getVoices();
  // 如果太少，等异步加载
  if (voices.value.length <= 3) {
    speechSynthesis.onvoiceschanged = () => {
      voices.value = speechSynthesis.getVoices();
    };
  }
}

function save() {
  localStorage.setItem("llm_api_key", apiKey.value.trim());
  localStorage.setItem("llm_provider", provider.value);
  localStorage.setItem("llm_model", modelId.value);
  localStorage.setItem("tts_voice", voiceName.value);
  console.log("[settings] saved", provider.value, modelId.value, voiceName.value);
  emit("saved");
  emit("close");
}

onMounted(() => {
  apiKey.value = localStorage.getItem("llm_api_key") || "";
  provider.value = (localStorage.getItem("llm_provider") as Provider) || "deepseek";
  updateModels();
  modelId.value = localStorage.getItem("llm_model") || models.value[0]?.id || "";
  loadVoices();
  voiceName.value = localStorage.getItem("tts_voice") || "";
});
</script>

<template>
  <div class="settings-overlay" @click.self="emit('close')">
    <div class="settings-panel">
      <h3>⚙️ 设置</h3>

      <label>提供商</label>
      <select v-model="provider" @change="updateModels">
        <option v-for="p in providers" :key="p.key" :value="p.key">{{ p.name }}</option>
      </select>

      <label>API Key</label>
      <input v-model="apiKey" type="password" placeholder="sk-..." />
      <div class="hint">密钥仅存储在本地浏览器中</div>

      <label>模型</label>
      <select v-model="modelId">
        <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>

      <label>语音（TTS）</label>
      <select v-model="voiceName">
        <option value="">系统默认</option>
        <option v-for="v in voices" :key="v.name" :value="v.name">
          {{ v.name }} ({{ v.lang }})
        </option>
      </select>

      <div class="actions">
        <button class="btn-cancel" @click="emit('close')">取消</button>
        <button class="btn-save" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: auto;
}
.settings-panel {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  color: #ccc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
h3 { color: #fff; margin: 0 0 8px; font-size: 16px; }
label { font-size: 12px; color: #999; margin-top: 8px; }
input, select {
  background: #2a2a3e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
input:focus, select:focus { border-color: #4a9eff; }
.hint { font-size: 11px; color: #666; }
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
button { padding: 8px 16px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer; }
.btn-cancel { background: #3a3a4e; color: #aaa; }
.btn-save { background: #4a9eff; color: #fff; }
.btn-save:hover { background: #3a8eee; }
</style>

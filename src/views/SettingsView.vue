<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import { ElMessage } from "element-plus";
import { PRESET_MODELS, type Provider } from "../composables/useChat";
import { listVoices, type TTSVoice } from "../utils/tts";
import type { AppSettings } from "../shared/Setting";

// ---- LLM 设置 ----
const apiKey = ref("");
const provider = ref<Provider>("deepseek");
const modelId = ref("");

const providers: { key: Provider; name: string; keyUrl: string }[] = [
  { key: "deepseek", name: "DeepSeek", keyUrl: "https://platform.deepseek.com/api_keys" },
  { key: "chatglm", name: "ChatGLM (智谱)", keyUrl: "https://open.bigmodel.cn/usercenter/apikeys" },
];

const currentProviderUrl = () => providers.find((p) => p.key === provider.value)?.keyUrl || providers[0].keyUrl;

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

// ---- 提示 ----
function showPrompt(msg: string) {
  ElMessage({ message: msg, type: "warning", duration: 5000 });
}

// ---- 保存 ----
const saving = ref(false);

async function save() {
  saving.value = true;
  const s: AppSettings = {
    llm_api_key: apiKey.value.trim(),
    llm_provider: provider.value,
    llm_model: modelId.value,
    tts_voice: voiceName.value,
  };
  await invoke("save_setting", { settings: s });
  saving.value = false;
  ElMessage({ message: "设置已保存", type: "success", duration: 2000 });
}

onMounted(async () => {
  document.documentElement.classList.add("dark");
  const p = useRoute().query.prompt as string | undefined;
  if (p) showPrompt(p);

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
    <h2 class="page-title">设置</h2>

    <el-form label-position="top" class="settings-form">
      <div class="section">
        <h3 class="section-title">AI 模型</h3>

        <el-form-item label="模型提供商">
          <el-select v-model="provider" @change="updateModels">
            <el-option v-for="p in providers" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </el-form-item>

        <el-form-item label="API Key">
          <el-input
            v-model="apiKey"
            type="password"
            placeholder="请输入 API Key"
            show-password
          />
        </el-form-item>
        <p class="key-link">
          <el-link :href="currentProviderUrl()" target="_blank" type="primary" :underline="false">
            获取 {{ providers.find(p => p.key === provider)?.name }} API Key
          </el-link>
        </p>

        <el-form-item label="模型">
          <el-select v-model="modelId">
            <el-option v-for="m in models" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
      </div>

      <el-divider />

      <div class="section">
        <h3 class="section-title">语音合成</h3>

        <el-form-item label="TTS 语音">
          <el-select v-model="voiceName" filterable placeholder="选择语音">
            <el-option label="zh-CN-XiaoyiNeural（默认）" value="" />
            <el-option
              v-for="v in voices"
              :key="v.ShortName"
              :label="`${v.FriendlyName} (${v.Gender})`"
              :value="v.ShortName"
            />
          </el-select>
        </el-form-item>
      </div>

      <div class="actions">
        <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.settings-window {
  padding: 28px 32px;
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--el-bg-color);
}

.page-title {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.settings-form {
  max-width: 480px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px;
}

.section {
  margin-bottom: 4px;
}

.settings-form .el-select,
.settings-form .el-input {
  width: 100%;
}

.key-link {
  margin: -16px 0 16px;
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>

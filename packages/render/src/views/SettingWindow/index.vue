<template>
  <div>
    <el-form v-if="formState.form">
      <el-form-item prop="lang" label="language">
        <el-select v-model="formState.form.lang">
          <el-option value="zh" label="简体中文"></el-option>
          <el-option value="en" label="English"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="alwaysOnTop" label="alwaysOnTop">
        <el-switch v-model="formState.form.alwaysOnTop"></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Setting } from "live2d-copilot-shared/src/Setting";
import { nextTick, reactive, watch } from "vue";
import { settingManager } from "../../modules/setting";

const formState = reactive({
  form: null as Setting | null,
  isSyncing: false,
});

watch(
  () => formState.form,
  () => {
    if (formState.isSyncing) return;
    settingManager.state.data = JSON.parse(JSON.stringify(formState.form));
    settingManager.saveSetting();
  },
  { deep: true }
);

watch(
  () => settingManager.state.data,
  async (newSetting) => {
    formState.isSyncing = true;
    formState.form = JSON.parse(JSON.stringify(newSetting));
    await nextTick();
    formState.isSyncing = false;
  },
  { immediate: true }
);
</script>

<style scoped></style>

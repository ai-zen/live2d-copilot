<template>
  <!-- :class="{
    'is-current': item._modelPath == currentState.current?._modelPath,
  }" -->
  <div class="card">
    <img class="image" :src="toLocalURI(item._modelDir + '/' + item.preview)" />
    <div class="content">
      <div class="title">{{ item.title }}</div>
    </div>
    <div class="status-info">{{ t("item_state.system_default") }}</div>
  </div>
</template>

<script setup lang="ts">
import { Live2DModelProfileEx } from "live2d-copilot-shared/src/Live2DModels";
import { toLocalURI } from "../utils/toLocalURI";
import { useI18n } from "../modules/i18n";

defineProps<{ item: Live2DModelProfileEx }>();

const { t } = useI18n();
</script>

<style scoped></style>

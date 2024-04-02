<template>
  <!-- :class="{
    'is-current': item._ModelPath == currentState.current?._ModelPath,
  }" -->
  <div class="card">
    <img class="image" :src="toLocalURI(item._ModelDir + '/' + item.Preview)" />
    <div class="content">
      <div class="title">{{ item.Title }}</div>
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

<template>
  <!-- :class="{
    'is-current': item._ModelPath == currentState.current?._ModelPath,
  }" -->
  <div class="card">
    <img class="image" :src="toLocalURI(item._ModelDir + '/' + item.Preview)" />
    <div class="content">
      <div class="title">{{ item.Title }}</div>
    </div>
    <div class="status-info">系统默认</div>
  </div>
</template>

<script setup lang="ts">
import { Live2DModelProfileEx } from "live2d-copilot-main/src/modules/live2DModelsManager";
import { toLocalURI } from "../../../utils/toLocalURI";

defineProps<{ item: Live2DModelProfileEx }>();
</script>

<style scoped></style>

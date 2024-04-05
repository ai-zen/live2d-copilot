<template>
  <div class="detail-column">
    <div class="detail-scroll-wrapper">
      <div class="detail-scroll-content">
        <img
          class="image"
          :src="toLocalURI(item._modelDir + '/' + item.preview)"
        />
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="desc">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Live2DModelProfileEx } from "live2d-copilot-shared/src/Live2DModels";
import { toLocalURI } from "../utils/toLocalURI";

defineProps<{ item: Live2DModelProfileEx }>();
</script>

<style scoped></style>

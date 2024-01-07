<template>
  <div class="detail-column">
    <div class="detail-scroll-wrapper">
      <div class="detail-scroll-content">
        <img
          class="image"
          :src="toLocalURI(item._ModelDir + '/' + item.Preview)"
        />
        <div class="content">
          <div class="title">{{ item.Title }}</div>
          <div class="desc">
            {{ item.Description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Live2DModelProfileEx } from "live2d-copilot-main/src/modules/live2DModelsManager";
import { toLocalURI } from "../../../utils/toLocalURI";

defineProps<{ item: Live2DModelProfileEx }>();
</script>

<style scoped></style>

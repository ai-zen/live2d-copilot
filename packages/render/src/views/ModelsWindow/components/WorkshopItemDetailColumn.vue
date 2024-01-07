<template>
  <div class="detail-column">
    <div class="detail-scroll-wrapper">
      <div class="detail-scroll-content">
        <img class="image" :src="item.additional?.previewUrl" />
        <div class="content">
          <div class="count-row">
            <el-rate :modelValue="getRate(item)" disabled />
            <div class="count-subscription">
              {{ item.additional?.numSubscriptions }}订阅
            </div>
            <div class="count-collection">
              {{ item.additional?.numFavorites }}收藏
            </div>
          </div>
          <div class="button-row">
            <el-button
              v-if="workshopItemsManager.isSubscribed(item.publishedFileId)"
              class="subscription-button"
              size="large"
              type="danger"
              :loading="
                workshopItemsManager.isUnsubscribing(item.publishedFileId)
              "
              @click="workshopItemsManager.unsubscribe(item.publishedFileId)"
              >取消订阅</el-button
            >
            <el-button
              v-else
              class="subscription-button"
              size="large"
              type="primary"
              :loading="
                workshopItemsManager.isSubscribing(item.publishedFileId)
              "
              @click="workshopItemsManager.subscribe(item.publishedFileId)"
              >订阅</el-button
            >
          </div>
          <div class="title">{{ item.title }}</div>
          <div class="desc">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WorkshopItem } from "live2d-copilot-shader/src/Steamworks";
import { workshopItemsManager } from "../modules/workshopItemsManager";

defineProps<{ item: WorkshopItem }>();

function getRate(item: WorkshopItem) {
  const { numUpvotes, numDownvotes } = item;
  if (!(numUpvotes + numDownvotes)) return -1;
  return (numUpvotes / (numUpvotes + numDownvotes)) * 5;
}
</script>

<style scoped></style>

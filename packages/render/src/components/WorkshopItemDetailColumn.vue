<template>
  <div class="detail-column">
    <div class="detail-scroll-wrapper">
      <div class="detail-scroll-content">
        <img class="image" :src="item.previewUrl" />
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="desc">{{ item.description }}</div>
          <div class="rate-row">
            <el-rate :modelValue="getRate(item)" disabled />
          </div>
          <div class="tags-row">
            <el-tag v-for="(tag, index) of item.tags" :key="index" round>{{
              t(`tags.${tag.toLowerCase()}`)
            }}</el-tag>
          </div>
          <div class="count-row">
            <div class="count-subscription">
              {{ t("count_subscription", item.statistics?.numSubscriptions) }}
            </div>
            <div class="count-collection">
              {{ t("count_collection", item.statistics?.numFavorites) }}
            </div>
          </div>
          <div class="button-row">
            <el-button
              v-if="workshopManager.isSubscribed(item.publishedFileId)"
              class="subscription-button"
              size="large"
              type="danger"
              :loading="workshopManager.isUnsubscribing(item.publishedFileId)"
              @click="workshopManager.unsubscribe(item.publishedFileId)"
              >{{ t("unsubscribe") }}</el-button
            >
            <el-button
              v-else
              class="subscription-button"
              size="large"
              type="primary"
              :loading="workshopManager.isSubscribing(item.publishedFileId)"
              @click="workshopManager.subscribe(item.publishedFileId)"
              >{{ t("subscribe") }}</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WorkshopItem } from "live2d-copilot-shared/src/Steamworks";
import { workshopManager } from "../modules/workshopManager";
import { useI18n } from "../modules/i18n";

defineProps<{ item: WorkshopItem }>();

const { t } = useI18n();

function getRate(item: WorkshopItem) {
  const { numUpvotes, numDownvotes } = item;
  if (!(numUpvotes + numDownvotes)) return -1;
  return (numUpvotes / (numUpvotes + numDownvotes)) * 5;
}
</script>

<style scoped></style>

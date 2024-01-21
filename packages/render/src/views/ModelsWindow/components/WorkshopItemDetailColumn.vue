<template>
  <div class="detail-column">
    <div class="detail-scroll-wrapper">
      <div class="detail-scroll-content">
        <img class="image" :src="item.previewUrl" />
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="desc">{{ item.description }}</div>
          <div class="count-row">
            <el-rate :modelValue="getRate(item)" disabled />
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
              v-if="workshopItemsManager.isSubscribed(item.publishedFileId)"
              class="subscription-button"
              size="large"
              type="danger"
              :loading="
                workshopItemsManager.isUnsubscribing(item.publishedFileId)
              "
              @click="workshopItemsManager.unsubscribe(item.publishedFileId)"
              >{{ t("unsubscribe") }}</el-button
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
import { workshopItemsManager } from "../modules/workshopItemsManager";
import { useI18n } from "../../../modules/i18n";

defineProps<{ item: WorkshopItem }>();

const { t } = useI18n();

function getRate(item: WorkshopItem) {
  const { numUpvotes, numDownvotes } = item;
  if (!(numUpvotes + numDownvotes)) return -1;
  return (numUpvotes / (numUpvotes + numDownvotes)) * 5;
}
</script>

<style scoped></style>

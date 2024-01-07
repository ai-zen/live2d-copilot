<template>
  <div
    class="card"
    :class="{
      'is-current': false,
    }"
  >
    <img class="image" :src="item.additional?.previewUrl" />
    <div class="content">
      <div class="title">{{ item.title }}</div>
    </div>
    <div
      v-if="workshopItemsManager.isDownloading(item.publishedFileId)"
      class="download-info"
    >
      <el-progress type="circle" :percentage="formatDownloadProgress(item)" />
    </div>
    <div
      class="status-info"
      v-if="
        workshopItemsManager.getCachedItemStatusData(item.publishedFileId)
          ?.itemState
      "
    >
      {{ formatItemStateText(item) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ItemState, WorkshopItem } from "live2d-copilot-shader/src/Steamworks";
import { workshopItemsManager } from "../modules/workshopItemsManager";

defineProps<{ item: WorkshopItem }>();

function formatDownloadProgress(item: WorkshopItem) {
  const statusData = workshopItemsManager.getCachedItemStatusData(
    item.publishedFileId
  );
  if (!statusData?.downloadInfo) return 0;
  return Math.round(
    (Number(statusData.downloadInfo.current) /
      (Number(statusData.downloadInfo.total) || 1)) *
      100
  );
}

function formatItemStateText(item: WorkshopItem) {
  const statusData = workshopItemsManager.getCachedItemStatusData(
    item.publishedFileId
  );
  if (!statusData?.itemState) return "";
  const stateTextList: [ItemState, string][] = [
    [ItemState.NONE, "无状态"],
    [ItemState.SUBSCRIBED, "已订阅"],
    [ItemState.LEGACY_ITEM, "遗留项目"],
    [ItemState.INSTALLED, "已安装"],
    [ItemState.NEEDS_UPDATE, "需要更新"],
    [ItemState.DOWNLOADING, "下载中"],
    [ItemState.DOWNLOAD_PENDING, "下载排队中"],
  ];
  return stateTextList
    .filter(([bit]) => bit & statusData.itemState)
    .map(([_bit, text]) => text)
    .join("+");
}
</script>

<style scoped></style>

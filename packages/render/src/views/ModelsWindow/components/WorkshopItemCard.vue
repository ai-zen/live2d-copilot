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
import { ItemState, WorkshopItem } from "live2d-copilot-shared/src/Steamworks";
import { workshopItemsManager } from "../modules/workshopItemsManager";
import { useI18n } from "../../../modules/i18n";

defineProps<{ item: WorkshopItem }>();

const { t } = useI18n();

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
    [ItemState.NONE, t("item_state.none")],
    [ItemState.SUBSCRIBED, t("item_state.subscribed")],
    [ItemState.LEGACY_ITEM, t("item_state.legacy_item")],
    [ItemState.INSTALLED, t("item_state.installed")],
    [ItemState.NEEDS_UPDATE, t("item_state.needs_update")],
    [ItemState.DOWNLOADING, t("item_state.downloading")],
    [ItemState.DOWNLOAD_PENDING, t("item_state.download_pending")],
  ];
  return stateTextList
    .filter(([bit]) => bit & statusData.itemState)
    .map(([_bit, text]) => text)
    .join("+");
}
</script>

<style scoped></style>

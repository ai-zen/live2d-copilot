<template>
  <div class="plugins-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('ugc_window.installed')" name="UGCInstalled">
        <UGCInstalled
          :tags-categories="[]"
          :required-tags="[]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.ChatTools])"
          :getSystemItems="getSystemItems"
          @ready="onReady"
          @focus-item="onFocusItem"
          ref="UGCInstalledRef"
        ></UGCInstalled>
      </el-tab-pane>
      <el-tab-pane :label="t('ugc_window.workshop')" name="UGCWorkshop">
        <UGCWorkshop
          :tags-categories="[]"
          :required-tags="[]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.ChatTools])"
        ></UGCWorkshop>
      </el-tab-pane>
      <el-tab-pane :label="t('ugc_window.publish')" name="UGCPublish">
        <UGCPublish></UGCPublish>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import UGCInstalled, { InstalledItem } from "../../components/UGCInstalled.vue";
import UGCPublish from "../../components/UGCPublish.vue";
import UGCWorkshop from "../../components/UGCWorkshop.vue";
import {
  ItemTypeTags,
  getExcludedTagsByItemTypes,
} from "../../composables/useUGCTagsOptions";
import { useI18n } from "../../modules/i18n";
import { WorkshopItemStatusData, workshop } from "../../modules/workshop";

const { t } = useI18n();

const UGCInstalledRef = ref<InstanceType<typeof UGCInstalled>>();

const activeName = ref("UGCInstalled");

async function getSystemItems() {
  return [];
}

async function onReady() {}

async function onFocusItem(_item: InstalledItem) {}

function onUnsubscribed(_itemId: bigint, _statusData: WorkshopItemStatusData) {}

onMounted(async () => {
  workshop.eventBus.on("unsubscribed", onUnsubscribed);
});

onUnmounted(() => {
  workshop.eventBus.off("unsubscribed", onUnsubscribed);
});
</script>

<style lang="scss" scoped>
.plugins-window {
  width: 100%;
  height: 100%;
}

.tabs:deep() {
  height: 100%;
  display: flex;
  flex-direction: column;
  .el-tabs__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .el-tab-pane {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
  }
  .el-tabs__header {
    margin: 0px;
  }
  .el-tabs__item.el-tabs__item {
    padding: 0 20px;
  }
}
</style>

<template>
  <div class="models-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('models_window.installed')" name="UGCInstalled">
        <UGCInstalled
          :getSystemItems="getSystemItems"
          @ready="onReady"
          @focus-item="onFocusItem"
          ref="UGCInstalledRef"
        ></UGCInstalled>
      </el-tab-pane>
      <el-tab-pane :label="t('models_window.workshop')" name="UGCWorkshop">
        <UGCWorkshop></UGCWorkshop>
      </el-tab-pane>
      <el-tab-pane :label="t('models_window.publish')" name="UGCPublish">
        <UGCPublish :beforePublish="onBeforePublish"></UGCPublish>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import UGCInstalled, {
  InstalledItem,
  InstalledItemType,
} from "../../components/UGCInstalled.vue";
import UGCWorkshop from "../../components/UGCWorkshop.vue";
import UGCPublish from "../../components/UGCPublish.vue";
import { useI18n } from "../../modules/i18n";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import { rpc } from "../../modules/rpc";
import { WorkshopItemStatusData, workshop } from "../../modules/workshop";
import { Live2DModelProfileEx } from "live2d-copilot-shared/src/Live2DModels";

const winApi = rpc.use<Methods>("models-window");

const { t } = useI18n();

const UGCInstalledRef = ref<InstanceType<typeof UGCInstalled>>();

const activeName = ref("UGCInstalled");

async function getSystemItems() {
  const profiles = await winApi.loadProfiles();
  const systemItems = profiles.map(
    (item): InstalledItem => ({
      type: InstalledItemType.SystemItem,
      systemItem: item,
    })
  );
  return systemItems;
}

async function onReady() {
  await loadUsedItem();
  focusUsedItem();
}

async function onBeforePublish(form: {
  title: string;
  description: string;
  contentPath: string;
  previewPath: string;
}) {
  await winApi.buildProfile(form);
}

async function onFocusItem(item: InstalledItem) {
  if (item.type == InstalledItemType.SystemItem) {
    usedState.currentProfile = item.systemItem;
    await winApi.setCurrent(item.systemItem!._ModelPath);
  } else {
    const statusData = await workshop.updateItemStatusData(
      item.workshopItem!.publishedFileId
    );
    // if the item is installed.
    if (statusData?.installInfo?.folder) {
      const profile = await winApi.loadProfile(statusData.installInfo.folder);
      if (profile) {
        usedState.currentProfile = profile;
        await winApi.setCurrent(profile._ModelPath);
      }
    }
  }
}

function onUnsubscribed(itemId: bigint, statusData: WorkshopItemStatusData) {
  if (!UGCInstalledRef.value) return;
  const { listState, focusItem } = UGCInstalledRef.value;

  // If the unsubscribed item is currently in use, switch the currently in use item to the first item in the list.
  let fallbackItem = listState.list.find(
    (item) => itemId != item.workshopItem?.publishedFileId
  );
  if (
    statusData.installInfo?.folder == usedState.currentProfile?._ModelDir &&
    fallbackItem
  ) {
    focusItem(fallbackItem);
  }
}

const usedState = reactive({
  currentProfile: null as Live2DModelProfileEx | null,
  isLoading: false,
  isReady: false,
});

async function loadUsedItem() {
  try {
    usedState.isLoading = true;
    usedState.currentProfile = await winApi.getCurrentProfile();
    usedState.isReady = true;
  } catch (error) {
  } finally {
    usedState.isLoading = false;
  }
}

function focusUsedItem() {
  if (!UGCInstalledRef.value) return;
  const { listState, focusState } = UGCInstalledRef.value;
  listState.list.forEach((item) => {
    if (item.type == InstalledItemType.SystemItem) {
      if (item.systemItem?._ModelDir == usedState.currentProfile?._ModelDir) {
        focusState.current = item;
      }
    } else {
      const statusData = workshop.getCachedItemStatusData(
        item.workshopItem!.publishedFileId
      );
      if (
        statusData?.installInfo?.folder == usedState.currentProfile?._ModelDir
      ) {
        focusState.current = item;
      }
    }
  });
}

onMounted(async () => {
  workshop.eventBus.on("unsubscribed", onUnsubscribed);
});

onUnmounted(() => {
  workshop.eventBus.off("unsubscribed", onUnsubscribed);
});
</script>

<style lang="scss" scoped>
.models-window {
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

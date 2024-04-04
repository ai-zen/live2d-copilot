<template>
  <div class="models-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('ugc_window.installed')" name="UGCInstalled">
        <UGCInstalled
          :tags-categories="[
            TagsCategories.AgeRatingTags,
            TagsCategories.ModelsTags,
          ]"
          :required-tags="[]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.Models])"
          :getSystemItems="getSystemItems"
          @ready="onReady"
          @focus-item="onFocusItem"
          ref="UGCInstalledRef"
        ></UGCInstalled>
      </el-tab-pane>

      <el-tab-pane :label="t('ugc_window.workshop')" name="UGCWorkshop">
        <UGCWorkshop
          :tags-categories="[
            TagsCategories.AgeRatingTags,
            TagsCategories.ModelsTags,
          ]"
          :required-tags="[]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.Models])"
        ></UGCWorkshop>
      </el-tab-pane>

      <el-tab-pane :label="t('ugc_window.publish')" name="UGCPublish">
        <UGCPublish
          :beforePublish="onBeforePublish"
          :default-form="DEFAULT_CUSTOM_FORM"
        >
          <template #form-extends="{ form }">
            <el-form-item
              prop="itemTypeTag"
              :label="t('publish_page.item_type_tags')"
              :rules="{
                required: true,
                message: t('publish_page.item_type_tags_required'),
              }"
            >
              <el-radio-group v-model="form.itemTypeTag" disabled>
                <el-radio
                  v-for="option of tagsGroupRecord[TagsCategories.ItemTypeTags]
                    .children"
                  :key="option.value"
                  :label="option.value"
                  >{{ option.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>

            <el-form-item
              prop="ageRatingTag"
              :label="t('publish_page.age_rating_tags')"
              :rules="{
                required: true,
                message: t('publish_page.age_rating_tags_required'),
              }"
            >
              <el-radio-group v-model="form.ageRatingTag">
                <el-radio
                  v-for="option of tagsGroupRecord[TagsCategories.AgeRatingTags]
                    .children"
                  :key="option.value"
                  :label="option.value"
                  >{{ option.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>

            <el-form-item
              prop="modelsTag"
              :label="t('publish_page.models_tags')"
              :rules="{
                required: true,
                message: t('publish_page.models_tags_required'),
              }"
            >
              <el-radio-group v-model="form.modelsTag">
                <el-radio
                  v-for="option of tagsGroupRecord[TagsCategories.ModelsTags]
                    .children"
                  :key="option.value"
                  :label="option.value"
                  >{{ option.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </template>
        </UGCPublish>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import { Live2DModelProfileEx } from "live2d-copilot-shared/src/Live2DModels";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import UGCInstalled, {
  InstalledItem,
  InstalledItemType,
} from "../../components/UGCInstalled.vue";
import UGCPublish from "../../components/UGCPublish.vue";
import UGCWorkshop from "../../components/UGCWorkshop.vue";
import {
  AgeRatingTags,
  ItemTypeTags,
  ModelsTags,
  TagsCategories,
  getExcludedTagsByItemTypes,
  useTagsOptions,
} from "../../composables/useUGCTagsOptions";
import { useI18n } from "../../modules/i18n";
import { rpc } from "../../modules/rpc";
import { WorkshopItemStatusData, workshop } from "../../modules/workshop";

const DEFAULT_CUSTOM_FORM = {
  itemTypeTag: ItemTypeTags.Models,
  ageRatingTag: AgeRatingTags.Everyone,
  modelsTag: ModelsTags.Other,
};

const { tagsGroupRecord } = useTagsOptions([
  TagsCategories.AgeRatingTags,
  TagsCategories.ModelsTags,
  TagsCategories.ItemTypeTags,
]);

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

async function onBeforePublish(form: any) {
  await winApi.buildProfile(form);

  form.tags ??= [];
  if (form.itemTypeTag) form.tags.push(form.itemTypeTag);
  if (form.modelsTag) form.tags.push(form.modelsTag);
  if (form.ageRatingTag) form.tags.push(form.ageRatingTag);

  return form;
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
    (item) =>
      item.type == InstalledItemType.WorkshopItem &&
      itemId != item.workshopItem?.publishedFileId
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

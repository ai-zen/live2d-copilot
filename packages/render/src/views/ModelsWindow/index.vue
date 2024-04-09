<template>
  <div class="models-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('ugc_window.installed')" name="UGCInstalled">
        <UGCInstalled
          :tags-categories="[
            TagsCategories.AgeRatingTags,
            TagsCategories.ModelsTags,
          ]"
          :required-tags="[ItemTypeTags.Models]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.Models])"
          :getSystemItems="getSystemItems"
          @ready="onReady"
          @focus-item="onFocusItem"
          ref="UGCInstalledRef"
        >
        </UGCInstalled>
      </el-tab-pane>

      <el-tab-pane :label="t('ugc_window.workshop')" name="UGCWorkshop">
        <UGCWorkshop
          :tags-categories="[
            TagsCategories.AgeRatingTags,
            TagsCategories.ModelsTags,
          ]"
          :required-tags="[ItemTypeTags.Models]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.Models])"
        ></UGCWorkshop>
      </el-tab-pane>

      <el-tab-pane :label="t('ugc_window.publish')" name="UGCPublish">
        <UGCPublish
          :beforePublish="beforePublish"
          :getFormExtendsDefault="getFormExtendsDefault"
          :echoFormByItem="echoFormByItem"
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

            <el-form-item
              prop="chat.prompt"
              :label="t('publish_page.chat_prompt')"
              :rules="{
                required: true,
                message: t('publish_page.chat_prompt_required'),
              }"
            >
              <el-input v-model="form.chat.prompt" type="textarea"></el-input>
            </el-form-item>

            <el-form-item
              prop="tts.type"
              :label="t('publish_page.tts_type')"
              :rules="{
                required: true,
                message: t('publish_page.tts_type_required'),
              }"
            >
              <el-radio-group v-model="form.tts.type">
                <el-radio label="azure">Azure</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              v-if="form.tts.type == 'azure'"
              prop="tts.azure.name"
              :label="t('publish_page.tts_azure_name')"
              :rules="{
                required: true,
                message: t('publish_page.tts_azure_name_required'),
              }"
            >
              <el-select-v2
                v-model="form.tts.azure.name"
                :options="AzureTTSNameOptions"
              >
              </el-select-v2>
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
import {
  AgeRatingTags,
  InstalledItem,
  InstalledItemType,
  ItemTypeTags,
  ModelsTags,
  TagsCategories,
  WorkshopExtendItem,
  WorkshopItem,
} from "live2d-copilot-shared/src/Steamworks";
import { UGCPublishFormWithCustom } from "live2d-copilot-shared/src/UGCPublish";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import AzureTTSList from "../../assets/azure-tts-list.json";
import UGCInstalled from "../../components/UGCInstalled.vue";
import UGCPublish from "../../components/UGCPublish.vue";
import UGCWorkshop from "../../components/UGCWorkshop.vue";
import {
  getExcludedTagsByItemTypes,
  useTagsOptions,
} from "../../composables/useUGCTagsOptions";
import { broadcaster } from "../../modules/broadcaster";
import { useI18n } from "../../modules/i18n";
import { rpc } from "../../modules/rpc";
import { workshopManager } from "../../modules/workshopManager";

const winApi = rpc.use<Methods>("models-window");

const { t } = useI18n();

const UGCInstalledRef = ref<InstanceType<typeof UGCInstalled>>();

const activeName = ref("UGCInstalled");

function getFormExtendsDefault() {
  return {
    itemTypeTag: ItemTypeTags.Models,
    ageRatingTag: AgeRatingTags.Everyone,
    modelsTag: ModelsTags.Other,
    chat: {
      prompt: t("publish_page.chat_prompt_default"),
    },
    tts: {
      type: "azure",
      azure: {
        name: t("publish_page.tts_azure_default"),
      },
    },
  };
}

async function echoFormByItem(item: WorkshopItem) {
  return {
    title: item.title,
    description: item.description,
    visibility: item.visibility,
    tags: item.tags,
  };
}

const { tagsGroupRecord } = useTagsOptions([
  TagsCategories.AgeRatingTags,
  TagsCategories.ModelsTags,
  TagsCategories.ItemTypeTags,
]);

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

async function beforePublish(
  form: UGCPublishFormWithCustom<ReturnType<typeof getFormExtendsDefault>>
) {
  await winApi.buildProfile(form);

  if (form.itemTypeTag) form.tags.push(form.itemTypeTag);
  if (form.modelsTag) form.tags.push(form.modelsTag);
  if (form.ageRatingTag) form.tags.push(form.ageRatingTag);

  return form;
}

async function onFocusItem(item: InstalledItem) {
  if (item.type == InstalledItemType.SystemItem) {
    usedState.currentProfile = item.systemItem;
    await winApi.setCurrent(item.systemItem!._modelPath);
  } else {
    const statusData = workshopManager.state.subscribed.get(
      item.workshopItem!.publishedFileId
    );
    // if the item is installed.
    if (statusData?.installInfo?.folder) {
      const profile = await winApi.loadProfile(statusData.installInfo.folder);
      if (profile) {
        usedState.currentProfile = profile;
        await winApi.setCurrent(profile._modelPath);
      }
    }
  }
}

function onUnsubscribed(itemId: bigint, statusData: WorkshopExtendItem) {
  if (!UGCInstalledRef.value) return;
  const { listState, focusItem } = UGCInstalledRef.value;

  // If the unsubscribed item is currently in use, switch the currently in use item to the first item in the list.
  let fallbackItem = listState.list.find(
    (item) =>
      item.type == InstalledItemType.SystemItem ||
      (item.type == InstalledItemType.WorkshopItem &&
        itemId != item.workshopItem?.publishedFileId)
  );
  if (
    statusData.installInfo?.folder == usedState.currentProfile?._modelDir &&
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
      if (item.systemItem?._modelDir == usedState.currentProfile?._modelDir) {
        focusState.current = item;
      }
    } else {
      const statusData = workshopManager.state.subscribed.get(
        item.workshopItem!.publishedFileId
      );
      if (
        statusData?.installInfo?.folder == usedState.currentProfile?._modelDir
      ) {
        focusState.current = item;
      }
    }
  });
}

onMounted(async () => {
  broadcaster.on("workshop:unsubscribed", onUnsubscribed);
});

onUnmounted(() => {
  broadcaster.off("workshop:unsubscribed", onUnsubscribed);
});

const AzureTTSNameOptions = AzureTTSList.map((item) => ({
  label: item.LocalName,
  value: item.ShortName,
}));
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
../../modules/workshopManager

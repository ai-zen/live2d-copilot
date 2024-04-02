<template>
  <div class="publish">
    <el-form class="form" :model="form" label-width="144px" ref="formRef">
      <el-form-item
        prop="publishType"
        :label="t('publish_page.publish_type')"
        :rules="{ required: true }"
      >
        <el-radio-group v-model="form.publishType">
          <el-radio :label="PublishType.Add">{{
            t("publish_page.publish_type_add")
          }}</el-radio>
          <el-radio :label="PublishType.Update">{{
            t("publish_page.publish_type_update")
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        prop="itemId"
        v-if="form.publishType == PublishType.Update"
        :label="t('publish_page.item_id')"
        :rules="{ required: true, message: t('publish_page.item_id_required') }"
      >
        <el-input
          :placeholder="t('publish_page.item_id_placeholder')"
          v-model="form.itemId"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="contentPath"
        :label="t('publish_page.content_path')"
        :rules="{
          required: true,
          message: t('publish_page.content_path_required'),
        }"
      >
        <el-input
          :placeholder="t('publish_page.content_path_placeholder')"
          v-model="form.contentPath"
        ></el-input>
        <el-button
          type="primary"
          plain
          style="margin-top: 6px"
          @click="selectContentDir"
          >{{ t("publish_page.content_path_select_dir") }}</el-button
        >
      </el-form-item>
      <el-form-item
        prop="previewPath"
        :label="t('publish_page.preview_path')"
        :rules="{
          required: true,
          message: t('publish_page.preview_path_required'),
        }"
        @click="selectPreviewFile"
      >
        <el-input
          :placeholder="t('publish_page.preview_path_placeholder')"
          v-model="form.previewPath"
        ></el-input>
        <el-row align="middle" style="margin-top: 6px">
          <el-button type="primary" plain>{{
            t("publish_page.preview_path_select_file")
          }}</el-button>
          <div class="tips">
            <el-icon class="icon"><InfoFilled /></el-icon>
            {{ t("publish_page.preview_path_size_limit") }}
          </div>
        </el-row>
      </el-form-item>
      <el-form-item
        prop="title"
        :label="t('publish_page.item_title')"
        :rules="{
          required: true,
          message: t('publish_page.item_title_required'),
        }"
      >
        <el-input
          :placeholder="t('publish_page.item_title_placeholder')"
          v-model="form.title"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="description"
        :label="t('publish_page.item_description')"
      >
        <el-input
          type="textarea"
          :placeholder="t('publish_page.item_description_placeholder')"
          v-model="form.description"
        ></el-input>
      </el-form-item>

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

      <el-form-item prop="changeNote" :label="t('publish_page.change_note')">
        <el-input
          type="textarea"
          :placeholder="t('publish_page.change_note_placeholder')"
          v-model="form.changeNote"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="visibility"
        :label="t('publish_page.visibility')"
        :rules="{
          required: true,
          message: t('publish_page.visibility_required'),
        }"
      >
        <el-radio-group v-model="form.visibility">
          <el-radio :label="UgcItemVisibility.Public">{{
            t("publish_page.visibility_options.public")
          }}</el-radio>
          <el-radio :label="UgcItemVisibility.FriendsOnly">{{
            t("publish_page.visibility_options.friends_only")
          }}</el-radio>
          <el-radio :label="UgcItemVisibility.Private">{{
            t("publish_page.visibility_options.private")
          }}</el-radio>
          <el-radio :label="UgcItemVisibility.Unlisted">{{
            t("publish_page.visibility_options.unlisted")
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">{{
          t("publish_page.submit")
        }}</el-button>
      </el-form-item>
    </el-form>

    <div class="publish-wrapper" v-if="publishState.isPublishing">
      <el-steps
        :active="(publishState.progressPayload?.status ?? 0) - 1"
        align-center
        finish-status="success"
      >
        <el-step
          v-for="step in steps"
          :key="step.value"
          :title="step.label"
        ></el-step>
      </el-steps>
      <template
        v-if="
          publishState.progressPayload?.status === UpdateStatus.UploadingContent
        "
      >
        <el-progress :percentage="getProgressPercentage"></el-progress>
        <div class="title">{{ t("publish_page.uploading") }}</div>
      </template>
    </div>

    <div class="result-wrapper" v-if="publishState.isSuccess">
      <el-result
        icon="success"
        :title="t('publish_page.publish_success')"
        :sub-title="publishState.successMessage"
      >
        <template #extra>
          <el-button type="primary" @click="back">{{
            t("publish_page.back")
          }}</el-button>
        </template>
      </el-result>
    </div>

    <div class="result-wrapper" v-if="publishState.isError">
      <el-result
        icon="error"
        :title="t('publish_page.publish_error')"
        :sub-title="publishState.errorMessage"
      >
        <template #extra>
          <el-button type="primary" @click="back">{{
            t("publish_page.back")
          }}</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from "@element-plus/icons-vue";
import { ElForm, ElInput, ElMessage } from "element-plus";
import type { Methods as SteamworksAPIMethods } from "live2d-copilot-main/src/windows/preloads/steamworks";
import {
  UgcItemVisibility,
  UpdateStatus,
  UpdateProgress,
  UgcUpdate,
} from "live2d-copilot-shared/src/Steamworks";
import { computed, nextTick, reactive, ref, toRaw, defineProps } from "vue";
import { rpc } from "../modules/rpc";
import {
  useTagsOptions,
  TagsCategories,
  AgeRatingTags,
  ModelsTags,
  ItemTypeTags,
} from "../composables/useUGCTagsOptions";
import { useI18n } from "../modules/i18n";

const props = defineProps<{
  beforePublish: (form: typeof DEFAULT_FORM) => Promise<void>;
}>();

const { t } = useI18n();

const steamworksApi = rpc.use<SteamworksAPIMethods>("steamworks");

const formRef = ref<null | InstanceType<typeof ElForm>>(null);

const { tagsGroupRecord } = useTagsOptions([
  TagsCategories.AgeRatingTags,
  TagsCategories.ModelsTags,
  TagsCategories.ItemTypeTags,
]);

enum PublishType {
  Add = 0,
  Update = 1,
}

const DEFAULT_FORM = {
  publishType: PublishType.Add,
  itemId: "",
  title: "",
  description: "",
  visibility: UgcItemVisibility.Public,
  contentPath: "",
  previewPath: "",
  changeNote: "",
  itemTypeTag: ItemTypeTags.Models,
  ageRatingTag: AgeRatingTags.Everyone,
  modelsTag: ModelsTags.Other,
};

const form = reactive(structuredClone(DEFAULT_FORM));

async function selectContentDir() {
  try {
    const result = await steamworksApi.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.filePaths[0]) {
      form.contentPath = result.filePaths[0];
    }
  } catch (error) {
    console.log(error);
  }
}

async function selectPreviewFile() {
  try {
    const result = await steamworksApi.showOpenDialog({
      properties: ["openFile"],
      filters: [{ extensions: ["png"], name: t("publish_page.image") }],
    });
    if (result.filePaths[0]) {
      form.previewPath = result.filePaths[0];
    }
  } catch (error) {
    console.log(error);
  }
}

const publishState = reactive({
  isPublishing: false,
  progressPayload: null as UpdateProgress | null,
  isSuccess: false,
  successMessage: "",
  isError: false,
  errorMessage: "",
});

async function onSubmit() {
  try {
    await formRef.value?.validate();
  } catch (error) {
    ElMessage.error(t("publish_page.submit_validate_error_message"));
    return;
  }

  try {
    publishState.isPublishing = true;

    await props.beforePublish(toRaw(form));

    let result: { itemId: bigint } | undefined;
    let itemId: bigint | undefined = undefined;

    if (form.publishType == PublishType.Add) {
      const result = await steamworksApi.createItem();
      if (result?.itemId) itemId = result.itemId;
    } else {
      itemId = BigInt(form.itemId);
    }

    if (!itemId) throw new Error(t("publish_page.no_valid_item_id_obtained"));

    result = await steamworksApi.updateItem(
      itemId,
      <UgcUpdate>{
        title: form.title,
        description: form.description,
        contentPath: form.contentPath,
        previewPath: form.previewPath,
        tags: (() => {
          let tags: string[] = [];
          if (form.itemTypeTag) tags.push(form.itemTypeTag);
          if (form.modelsTag) tags.push(form.modelsTag);
          if (form.ageRatingTag) tags.push(form.ageRatingTag);
          return tags;
        })(),
        visibility: form.visibility,
        changeNote: form.changeNote,
      },
      (data) => {
        console.log("progressCallback", data);
        publishState.progressPayload = data as unknown as UpdateProgress;
      },
      500
    );
    if (!result) throw new Error(t("publish_page.no_valid_results_returned"));

    Object.assign(form, DEFAULT_FORM);
    publishState.isPublishing = false;
    publishState.isSuccess = true;
    publishState.successMessage = `ID ${result?.itemId}`;
    await nextTick(); // Wait for two tick before clear validate messages.
    await nextTick();
    formRef.value?.clearValidate();
  } catch (error: any) {
    publishState.isPublishing = false;
    publishState.isError = true;
    publishState.errorMessage =
      error?.message || t("publish_page.unknown_error");
  }
}

const steps = computed(() => [
  {
    value: UpdateStatus.PreparingConfig,
    label: t("publish_page.update_status.preparing_config"),
  },
  {
    value: UpdateStatus.PreparingContent,
    label: t("publish_page.update_status.preparing_content"),
  },
  {
    value: UpdateStatus.UploadingContent,
    label: t("publish_page.update_status.uploading_content"),
  },
  {
    value: UpdateStatus.UploadingPreviewFile,
    label: t("publish_page.update_status.uploading_preview_file"),
  },
  {
    value: UpdateStatus.CommittingChanges,
    label: t("publish_page.update_status.committing_changes"),
  },
]);

const getProgressPercentage = computed(() => {
  if (!publishState.progressPayload) return 0;
  return Number(
    (
      ((Number(String(publishState.progressPayload.progress)) || 0) /
        (Number(String(publishState.progressPayload.total)) || 1)) *
      100
    ).toFixed(2)
  );
});

function back() {
  publishState.isPublishing = false;
  publishState.progressPayload = null;
  publishState.isSuccess = false;
  publishState.successMessage = "";
  publishState.isError = false;
  publishState.errorMessage = "";
  Object.assign(form, structuredClone(DEFAULT_FORM));
}
</script>

<style lang="scss" scoped>
.publish {
  flex-grow: 1;
  height: 0px;
  width: 100%;
  overflow-y: auto;
  position: relative;
}

.publish-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: var(--el-mask-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 1;
  .el-steps {
    width: 600px;
  }
  .el-progress {
    margin-top: 60px;
    width: 600px;
  }
  .title {
    margin-top: 10px;
    font-size: 16px;
  }
}

.result-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: var(--el-mask-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 1;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px;
  height: 300px;
  border: thin dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    border-color: var(--el-color-primary);
  }

  .icon {
    font-size: 67px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 16px;
    line-height: 50px;
  }
  .text {
    color: var(--el-text-color-regular);
    font-size: 14px;
    text-align: center;
  }
}

.guide {
  padding: 2em;
  img {
    display: block;
  }
  em {
    color: var(--el-color-primary);
  }
}

.form {
  padding: 2em;
}

.tips {
  display: flex;
  align-items: center;
  margin-left: 1em;
  color: var(--el-text-color-placeholder);
  .icon {
    margin-right: 0.5em;
  }
}
</style>

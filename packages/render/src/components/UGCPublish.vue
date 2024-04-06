<template>
  <div
    class="publish"
    :class="{
      'is-publishing': publishState.isPublishing,
    }"
  >
    <el-form class="form" :model="form" label-width="200px" ref="formRef">
      <el-form-item
        prop="publishType"
        :label="t('publish_page.publish_type')"
        :rules="{ required: true }"
      >
        <el-radio-group v-model="form.publishType">
          <el-radio :label="UGCPublishType.Add">{{
            t("publish_page.publish_type_add")
          }}</el-radio>
          <el-radio :label="UGCPublishType.Update">{{
            t("publish_page.publish_type_update")
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        prop="itemId"
        v-if="form.publishType == UGCPublishType.Update"
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
            <el-icon class="icon">
              <InfoFilled />
            </el-icon>
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

      <slot
        name="form-extends"
        :form="(form as UGCPublishFormWithCustom<F>)"
      ></slot>

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
  </div>

  <div class="result-wrapper" v-if="publishState.isSuccess">
    <el-result
      icon="success"
      :title="t('publish_page.publish_success')"
      :sub-title="publishState.successMessage"
    >
      <template #extra>
        <el-button type="primary" @click="backAndReset">{{
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
        <el-button type="primary" @click="backToEdit">{{
          t("publish_page.back")
        }}</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts" generic="F">
import { InfoFilled } from "@element-plus/icons-vue";
import { ElForm, ElInput, ElMessage } from "element-plus";
import type { Methods as SteamworksAPIMethods } from "live2d-copilot-main/src/windows/preloads/steamworks";
import {
  UgcItemVisibility,
  UpdateProgress,
  UpdateStatus,
} from "live2d-copilot-shared/src/Steamworks";
import {
  UGCPublishForm,
  UGCPublishFormWithCustom,
  UGCPublishType,
} from "live2d-copilot-shared/src/UGCPublish";
import {
  computed,
  defineProps,
  nextTick,
  reactive,
  ref,
  toRaw,
  watch,
} from "vue";
import { i18n, useI18n } from "../modules/i18n";
import { rpc } from "../modules/rpc";

const props = defineProps<{
  beforePublish?: (
    form: UGCPublishFormWithCustom<F>
  ) => Promise<UGCPublishFormWithCustom<F>>;
  getFormExtendsDefault?: () => F;
}>();

const { t } = useI18n();

const steamworksApi = rpc.use<SteamworksAPIMethods>("steamworks");

const formRef = ref<null | InstanceType<typeof ElForm>>(null);

function createForm() {
  return {
    publishType: UGCPublishType.Add,
    itemId: "",
    title: "",
    description: "",
    visibility: UgcItemVisibility.Public,
    contentPath: "",
    previewPath: "",
    changeNote: "",
    tags: [],
    ...props.getFormExtendsDefault?.(),
  };
}

const form = reactive(createForm()) as UGCPublishForm;

// When the language is switched, reset the form.
watch(
  () => i18n.state.lang,
  () => {
    Object.assign(form, createForm());
  }
);

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

    let itemData = toRaw(form) as UGCPublishFormWithCustom<F>;

    if (props.beforePublish) itemData = await props.beforePublish(itemData);

    let result: { itemId: bigint } | undefined;
    let itemId: bigint | undefined = undefined;

    if (itemData.publishType == UGCPublishType.Add) {
      const result = await steamworksApi.createItem();
      if (result?.itemId) itemId = result.itemId;
    } else {
      itemId = BigInt(itemData.itemId);
    }

    if (!itemId) throw new Error(t("publish_page.no_valid_item_id_obtained"));

    result = await steamworksApi.updateItem(
      itemId,
      itemData,
      (data) => {
        console.log("progressCallback", data);
        publishState.progressPayload = data as unknown as UpdateProgress;
      },
      500
    );
    if (!result) throw new Error(t("publish_page.no_valid_results_returned"));

    Object.assign(itemData, createForm());
    publishState.isPublishing = false;
    publishState.isSuccess = true;
    publishState.successMessage = t(
      "publish_page.publish_success_tips",
      result?.itemId
    );
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

function backAndReset() {
  publishState.isPublishing = false;
  publishState.progressPayload = null;
  publishState.isSuccess = false;
  publishState.successMessage = "";
  publishState.isError = false;
  publishState.errorMessage = "";
  Object.assign(form, createForm());
}

function backToEdit() {
  publishState.isPublishing = false;
  publishState.progressPayload = null;
  publishState.isSuccess = false;
  publishState.successMessage = "";
  publishState.isError = false;
  publishState.errorMessage = "";
}
</script>

<style lang="scss" scoped>
.publish {
  flex-grow: 1;
  height: 0px;
  width: 100%;
  overflow-y: auto;

  &.is-publishing {
    overflow: hidden;
  }
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
  z-index: 2;
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

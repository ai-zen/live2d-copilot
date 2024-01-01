<template>
  <div class="publish">
    <el-form class="form" :model="form" label-width="100px" ref="formRef">
      <el-form-item
        prop="publishType"
        label="发布类型"
        :rules="{ required: true }"
      >
        <el-radio-group v-model="form.publishType">
          <el-radio :label="PublishType.Add">发布新项目</el-radio>
          <el-radio :label="PublishType.Update">更新已有项目</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        prop="itemId"
        v-if="form.publishType == PublishType.Update"
        label="项目ID"
        :rules="{ required: true, message: '更新已有项目时需要填写项目ID' }"
      >
        <el-input
          placeholder="如果您想更新一个现有项目，需要填写此ID"
          v-model="form.itemId"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="contentPath"
        label="文件夹"
        :rules="{
          required: true,
          message: '您需要选择一个文件夹用来上传到创意工坊',
        }"
      >
        <el-input
          placeholder="请输入或者选择文件夹绝对路径"
          v-model="form.contentPath"
        ></el-input>
        <el-button
          type="primary"
          plain
          style="margin-top: 6px"
          @click="selectContentDir"
          >+ 选择文件夹</el-button
        >
      </el-form-item>
      <el-form-item
        prop="previewPath"
        label="预览图"
        :rules="{
          required: true,
          message: '您需要为此项目提供一张图片',
        }"
        @click="selectPreviewFile"
      >
        <el-input
          placeholder="请输入或者选择预览图绝对路径"
          v-model="form.previewPath"
        ></el-input>
        <el-row align="middle" style="margin-top: 6px">
          <el-button type="primary" plain>+ 选择图片</el-button>
          <div class="tips">
            <el-icon class="icon"><InfoFilled /></el-icon>
            预览图尺寸为 512x512 像素，png 格式
          </div>
        </el-row>
      </el-form-item>
      <el-form-item
        prop="title"
        label="项目标题"
        :rules="{ required: true, message: '请填写项目标题' }"
      >
        <el-input placeholder="请输入项目标题" v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item prop="description" label="项目描述">
        <el-input
          type="textarea"
          placeholder="请输入项目描述"
          v-model="form.description"
        ></el-input>
      </el-form-item>
      <el-form-item prop="tags" label="标签">
        <el-row>
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="onTagClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="newTagState.isShow"
            ref="tagInputRef"
            v-model="newTagState.value"
            size="small"
            @keyup.enter="onInputConfirm"
            @blur="onInputConfirm"
            placeholder="请输入标签内容"
          />
          <el-button v-else type="success" plain size="small" @click="addTag">
            + 新标签
          </el-button>
        </el-row>
      </el-form-item>
      <el-form-item prop="changeNote" label="变更日志">
        <el-input
          type="textarea"
          placeholder="请输入变更日志"
          v-model="form.changeNote"
        ></el-input>
      </el-form-item>
      <el-form-item prop="visibility" label="更改可见性">
        <el-radio-group v-model="form.visibility">
          <el-radio :label="UgcItemVisibility.Public">公开</el-radio>
          <el-radio :label="UgcItemVisibility.FriendsOnly">仅限好友</el-radio>
          <el-radio :label="UgcItemVisibility.Private">隐藏</el-radio>
          <el-radio :label="UgcItemVisibility.Unlisted">非公开</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">发布</el-button>
      </el-form-item>
    </el-form>

    <div class="publish-wrapper" v-if="publishState.isPublishing">
      <el-steps
        :active="publishState.progressPayload?.status"
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
        <div class="title">上传中...</div>
      </template>
    </div>

    <div class="result-wrapper" v-if="publishState.isSuccess">
      <el-result
        icon="success"
        title="发布成功！"
        :sub-title="publishState.successMessage"
      >
        <template #extra>
          <el-button type="primary" @click="back">返回</el-button>
        </template>
      </el-result>
    </div>

    <div class="result-wrapper" v-if="publishState.isError">
      <el-result
        icon="error"
        title="发布失败！"
        :sub-title="publishState.errorMessage"
      >
        <template #extra>
          <el-button type="primary" @click="back">返回</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from "@element-plus/icons-vue";
import { ElForm, ElInput, ElMessage } from "element-plus";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import {
  UgcItemVisibility,
  UpdateStatus,
  UpdateProgress,
} from "live2d-copilot-shader/src/Steamworks";
import { computed, nextTick, reactive, ref, toRaw } from "vue";
import { rpc } from "../../modules/rpc";

const winApi = rpc.use<Methods>("models-window");

const formRef = ref<null | InstanceType<typeof ElForm>>(null);

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
  tags: [] as string[],
};

const form = reactive(structuredClone(DEFAULT_FORM));

const tagInputRef = ref<InstanceType<typeof ElInput>>();

const newTagState = reactive({
  value: "",
  isShow: false,
});

const onTagClose = (tag: string) => {
  form.tags.splice(form.tags.indexOf(tag), 1);
};

function addTag() {
  newTagState.isShow = true;
  nextTick(() => {
    tagInputRef.value?.input?.focus();
  });
}

const onInputConfirm = () => {
  if (newTagState.value) {
    form.tags.push(newTagState.value);
  }
  newTagState.isShow = false;
  newTagState.value = "";
};

async function selectContentDir() {
  try {
    const result = await winApi.showOpenDialog({
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
    const result = await winApi.showOpenDialog({
      properties: ["openFile"],
      filters: [{ extensions: ["png"], name: "图片" }],
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
    ElMessage.error("请确保所有信息填写正确！");
    return;
  }

  try {
    publishState.isPublishing = true;

    await winApi.buildProfile(toRaw(form));

    let result: { itemId: bigint } | undefined;
    let itemId = undefined;

    if (form.publishType == PublishType.Add) {
      const result = await winApi.createItem();
      if (result?.itemId) itemId = result.itemId;
    } else {
      itemId = BigInt(form.itemId);
    }

    if (!itemId) throw new Error("未获取有效itemId");

    result = await winApi.updateItem(
      itemId,
      toRaw<any>(form),
      (data) => {
        console.log("progressCallback", data);
        publishState.progressPayload = data as unknown as UpdateProgress;
      },
      500
    );
    if (!result) throw new Error("未返回有效结果");

    Object.assign(form, DEFAULT_FORM);
    publishState.isPublishing = false;
    publishState.isSuccess = true;
    publishState.successMessage = `ID ${result?.itemId}`;
    await nextTick(); // 等待两刻后清除验证信息
    await nextTick();
    formRef.value?.clearValidate();
  } catch (error: any) {
    publishState.isPublishing = false;
    publishState.isError = true;
    publishState.errorMessage = error?.message || "未知错误";
  }
}

const steps = [
  { value: UpdateStatus.PreparingConfig, label: "准备配置" },
  { value: UpdateStatus.PreparingContent, label: "准备内容" },
  { value: UpdateStatus.UploadingContent, label: "上传内容" },
  { value: UpdateStatus.UploadingPreviewFile, label: "上传文件" },
  { value: UpdateStatus.CommittingChanges, label: "提交变更记录" },
];

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

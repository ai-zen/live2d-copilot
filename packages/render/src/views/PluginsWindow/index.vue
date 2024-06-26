<template>
  <div class="plugins-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('ugc_window.installed')" name="UGCInstalled">
        <UGCInstalled
          :tags-categories="[]"
          :required-tags="[ItemTypeTags.ChatTools]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.ChatTools])"
          :getSystemItems="getSystemItems"
          ref="UGCInstalledRef"
        ></UGCInstalled>
      </el-tab-pane>
      <el-tab-pane :label="t('ugc_window.workshop')" name="UGCWorkshop">
        <UGCWorkshop
          :tags-categories="[]"
          :required-tags="[ItemTypeTags.ChatTools]"
          :excluded-tags="getExcludedTagsByItemTypes([ItemTypeTags.ChatTools])"
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
              prop="function.name"
              :label="t('publish_page.function_name')"
              :rules="{
                required: true,
                message: t('publish_page.function_name_required'),
                pattern: /^[a-zA-Z_]+$/,
              }"
            >
              <el-input
                v-model="form.function.name"
                :placeholder="t('publish_page.function_name_placeholder')"
              ></el-input>
            </el-form-item>

            <el-form-item
              prop="function.description"
              :label="t('publish_page.function_description')"
              :rules="{
                required: true,
                message: t('publish_page.function_description_required'),
              }"
            >
              <el-input
                v-model="form.function.description"
                :placeholder="
                  t('publish_page.function_description_placeholder')
                "
              ></el-input>
            </el-form-item>

            <el-form-item
              prop="function.parameters"
              :label="t('publish_page.function_parameters')"
            >
              <ParametersEditor v-model="form.function.parameters" />
            </el-form-item>

            <el-form-item label="Tips">
              <div class="tips">
                <el-text>{{ t("publish_page.code_tips") }}</el-text>
                <div
                  class="code-wrapper"
                  v-html="highlight(getExampleCode(form))"
                  @click="onExampleCodeClick(getExampleCode(form))"
                ></div>
              </div>
            </el-form-item>
          </template>
        </UGCPublish>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import type { JSONSchema7 } from "json-schema";
import type { Methods } from "live2d-copilot-main/src/windows/createPluginsWindow";
import {
  ItemTypeTags,
  TagsCategories,
  WorkshopItem,
} from "live2d-copilot-shared/src/Steamworks";
import { UGCPublishFormWithCustom } from "live2d-copilot-shared/src/UGCPublish";
import { ref } from "vue";
import ParametersEditor from "../../components/ParametersEditor.vue";
import UGCInstalled from "../../components/UGCInstalled.vue";
import UGCPublish from "../../components/UGCPublish.vue";
import UGCWorkshop from "../../components/UGCWorkshop.vue";
import {
  getExcludedTagsByItemTypes,
  useTagsOptions,
} from "../../composables/useUGCTagsOptions";
import { useI18n } from "../../modules/i18n";
import { rpc } from "../../modules/rpc";

const winApi = rpc.use<Methods>("plugins-window");

const { t } = useI18n();

const UGCInstalledRef = ref<InstanceType<typeof UGCInstalled>>();

const activeName = ref("UGCInstalled");

function getFormExtendsDefault() {
  return {
    itemTypeTag: ItemTypeTags.ChatTools,
    function: {
      parameters: {
        type: "object",
        properties: {
          arg1: {
            type: "string",
            description: "",
          },
        },
        required: ["arg1"],
      } as JSONSchema7,
      description: "",
      name: "",
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

function getExampleCode(
  form: UGCPublishFormWithCustom<ReturnType<typeof getFormExtendsDefault>>
) {
  const function_name = form.function.name || "foo";
  const keys = Object.keys(form.function.parameters.properties!);
  return `export function ${function_name}({ ${keys.join(",")} }){
  return '';
}`;
}

function highlight(code: string) {
  const code1 = hljs.highlight(code, {
    language: "javascript",
    ignoreIllegals: true,
  }).value;
  return `<pre class="hljs"><code>${code1}</code></pre>`;
}

const { tagsGroupRecord } = useTagsOptions([TagsCategories.ItemTypeTags]);

async function getSystemItems() {
  return [];
}

async function beforePublish(
  form: UGCPublishFormWithCustom<ReturnType<typeof getFormExtendsDefault>>
) {
  await winApi.buildProfile(JSON.parse(JSON.stringify(form)));

  if (form.itemTypeTag) form.tags.push(form.itemTypeTag);

  return form;
}

function onExampleCodeClick(code: string) {
  // copy the example code to clipboard
  window.navigator.clipboard.writeText(code).then(() => {
    ElMessage.success(t("copy_success"));
  });
}
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

.tips {
  width: 100%;
}

.code-wrapper:deep() {
  box-sizing: border-box;
  width: 100%;
  border: var(--el-border);
  border-radius: 6px;
  padding: 6px 12px;
  background-color: var(--el-bg-color);

  pre {
    margin: 0;
    line-height: 22px;
    background-color: transparent;

    code {
      font-size: 14px;
      font-family: monospace;
    }
  }
}
</style>
../../modules/workshopManager

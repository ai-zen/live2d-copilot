<template>
  <div class="editor">
    <!-- Loop through the metaData array -->
    <div class="editor-prop" v-for="(item, index) of metaData" :key="index">
      <el-row class="editor-prop-key">
        <!-- Input field for the key -->
        <el-input
          class="key"
          type="text"
          v-model.trim="item.key"
          :placeholder="t('parameters_editor.param_name')"
        />

        <!-- Select dropdown for the value type -->
        <el-select class="value" v-model="item.define.type">
          <el-option
            :label="t('parameters_editor.string')"
            value="string"
          ></el-option>
          <el-option
            :label="t('parameters_editor.boolean')"
            value="boolean"
          ></el-option>
          <el-option
            :label="t('parameters_editor.number')"
            value="number"
          ></el-option>
          <el-option
            :label="t('parameters_editor.array')"
            value="array"
          ></el-option>
          <el-option
            :label="t('parameters_editor.object')"
            value="object"
          ></el-option>
        </el-select>

        <!-- Checkbox for required property -->
        <el-checkbox class="required" v-model="item.required">{{
          t("parameters_editor.is_required")
        }}</el-checkbox>

        <!-- Button to remove the property -->
        <el-button type="danger" plain @click="removeProperty(index)">{{
          t("parameters_editor.delete_param")
        }}</el-button>
      </el-row>

      <div class="editor-prop-value">
        <!-- Textarea for the value description -->
        <el-input
          class="key"
          type="textarea"
          v-model="item.define.description"
          :placeholder="t('parameters_editor.param_description')"
        />
      </div>
    </div>

    <!-- Button to add a new property -->
    <el-row class="editor-actions">
      <el-button type="success" plain @click="addProperty">{{
        t("parameters_editor.add_param")
      }}</el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { JSONSchema7 } from "json-schema";
import { PropType, inject, nextTick, ref, watch } from "vue";
import { formItemContextKey, FormItemContext } from "element-plus";
import { useI18n } from "../modules/i18n";

const { t } = useI18n();

// Define component props
const props = defineProps({
  modelValue: {
    type: Object as PropType<JSONSchema7>,
  },
});

const emit = defineEmits<{
  "update:modelValue": [modelValue: JSONSchema7];
}>();

// Store the metadata of properties
const metaData = ref([] as { key: string; define: any; required: boolean }[]);

/**
 * Variable used to indicate whether external data is being synced.
 * When set to true, it will prevent triggering "update:modelValue" to prevent infinite loops.
 */
let isSyncing = false;

// Sync external data to internal state
watch(
  () => props.modelValue!.properties,
  async (newValue) => {
    isSyncing = true;
    metaData.value = Object.entries(newValue!).map(([key, value]) => ({
      key,
      define: value as any,
      required: props.modelValue?.required?.includes(key) ?? false,
    }));
    await nextTick();
    isSyncing = false;
  },
  { immediate: true }
);

// Sync internal state to external data
watch(
  metaData,
  (newValue) => {
    if (isSyncing) return;
    emit("update:modelValue", {
      ...props.modelValue,
      properties: Object.fromEntries(
        newValue
          .filter(({ key }) => Boolean(key))
          .map(({ key, define: value }) => [key, value])
      ),
      required: newValue
        .filter(({ required }) => required)
        .map(({ key }) => key),
    });
  },
  { deep: true }
);

// Function to add a new property
const addProperty = () => {
  const maxKeyNumber = Math.max(
    0,
    ...metaData.value.map(({ key }) =>
      Number(/^arg([\d]+$)/.exec(key)?.[1] ?? 0)
    )
  );

  metaData.value.push({
    key: `arg${maxKeyNumber + 1}`,
    define: {
      type: "string",
      description: "",
    },
    required: false,
  });
};

// Function to remove a property
const removeProperty = (index: number) => {
  metaData.value.splice(index, 1);
};

// Inject the FormItemContext
const elFormItem = inject(formItemContextKey, {} as FormItemContext);

// Watch for changes in props.modelValue and validate the form item
watch(
  () => props.modelValue,
  () => {
    elFormItem?.validate?.("change").catch(console.warn);
  }
);
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
}

.editor-prop {
  border-left: 2px solid var(--el-color-primary);
  padding-left: 12px;
}

.editor-prop + .editor-prop {
  margin-top: 12px;
}

.editor-prop-key {
  display: flex;
  align-items: center;
  width: 100%;
  .key,
  .value {
    width: 0px;
    flex-grow: 1;
    margin-right: 12px;
  }

  .required {
    margin-right: 12px;
  }
}

.editor-prop-value {
  margin-top: 12px;
}

.editor-prop + .editor-actions {
  margin-top: 12px;
}
</style>

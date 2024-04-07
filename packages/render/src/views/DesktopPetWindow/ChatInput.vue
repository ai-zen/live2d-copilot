<template>
  <div
    class="chat-input-wrapper"
    :style="{
      '--model-x': `${modelPosition.deviceX}px`,
      '--model-y': `${modelPosition.deviceY}px`,
      '--model-scale': `${modelPosition.relativeScale}`,
      '--offset-x': `${transform.offsetX}px`,
      '--offset-y': `${transform.offsetY}px`,
      '--scale': `${transform.scale}`,
    }"
  >
    <div class="chat-input">
      <div class="chat-input-icon"></div>
      <el-input
        class="chat-input-textarea"
        type="textarea"
        v-model="newMessage"
        resize="none"
        rows="3"
      >
      </el-input>
      <div class="chat-actions">
        <el-button
          class="move-button"
          size="small"
          plain
          circle
          type="primary"
          :ref="(btn: any) => moveableElRef = btn?.$el"
        >
          <el-icon><Rank /></el-icon>
        </el-button>
        <el-button
          class="send-button"
          size="small"
          plain
          round
          type="primary"
          @click="send"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChatInputTransform,
  Live2DModelPosition,
} from "live2d-copilot-shared/src/Live2DModels";
import { PropType, ref } from "vue";
import { useMoveable } from "./composables/useMoveable";
import { Rank, Promotion } from "@element-plus/icons-vue";
import { ElButton } from "element-plus";

const emit = defineEmits<{
  (e: "update:transform", value: ChatInputTransform): void;
  (e: "send", value: string): void;
}>();

const props = defineProps({
  modelPosition: {
    required: true,
    type: Object as PropType<Live2DModelPosition>,
  },
  transform: {
    required: true,
    type: Object as PropType<ChatInputTransform>,
    default: () => {
      return new ChatInputTransform();
    },
  },
});

const { moveableElRef } = useMoveable({
  getModelScale: () => props.modelPosition.relativeScale || 1,
  getTransform: () => props.transform,
  onUpdate: (newValue: ChatInputTransform) =>
    emit("update:transform", newValue),
});

const newMessage = ref("");

function send() {
  emit("send", newMessage.value);
  newMessage.value = "";
}
</script>

<style lang="scss" scoped>
.chat-input-wrapper {
  --model-x: 0px;
  --model-y: 0px;
  --model-scale: 1;
  --offset-x: 0px;
  --offset-y: 0px;
  --scale: 1;
  position: absolute;
  left: var(--model-x);
  top: var(--model-y);
  transform: translate(
      calc(-50% + var(--offset-x) * var(--model-scale)),
      calc(-50% + var(--offset-y) * var(--model-scale))
    )
    scale(calc(var(--scale) * var(--model-scale)));
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}

.chat-actions {
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: flex;
  align-items: center;
}

// .move-button {
// }

.send-button {
  margin-left: 6px;
}

.chat-input-textarea {
  width: 240px;
  :deep() {
    .el-textarea__inner {
      background-color: var(--el-mask-color);
      border-radius: 10px;
    }
  }
}
</style>

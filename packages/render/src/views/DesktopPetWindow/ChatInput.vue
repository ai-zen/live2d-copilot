<template>
  <div
    ref="moveableElRef"
    class="chat-input-wrapper"
    :style="{
      '--model-x': `${modelPosition.deviceX}px`,
      '--model-y': `${modelPosition.deviceY}px`,
      '--model-scale': `${modelPosition.relativeScale}`,
      '--offset-x': `${transform.OffsetX}px`,
      '--offset-y': `${transform.OffsetY}px`,
      '--scale': `${transform.Scale}`,
    }"
  >
    <div class="chat-input">
      <div class="chat-input-icon"></div>
      <textarea class="chat-input-textarea" v-model="newMessage"> </textarea>
      <div class="send-button" @click="send">send</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Live2DModelPosition,
  ChatInputTransform,
} from "live2d-copilot-shared/src/Live2DModels";
import { PropType, ref } from "vue";
import { useMoveable } from "./composables/useMoveable";
import { useChat } from "./composables/useChat";

const emit = defineEmits<{
  (e: "update:transform", value: ChatInputTransform): void;
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
  chatContext: {
    required: true,
    type: Object as PropType<ReturnType<typeof useChat>>,
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
  props.chatContext.sendNewMessage(newMessage.value);
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

.send-button {
  background-color: #fff;
}
</style>

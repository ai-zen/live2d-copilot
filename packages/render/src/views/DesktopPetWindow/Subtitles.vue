<template>
  <div
    ref="moveableElRef"
    class="subtitles-wrapper"
    :style="{
      '--model-x': `${modelPosition.deviceX}px`,
      '--model-y': `${modelPosition.deviceY}px`,
      '--model-scale': `${modelPosition.relativeScale}`,
      '--offset-x': `${transform.offsetX}px`,
      '--offset-y': `${transform.offsetY}px`,
      '--scale': `${transform.scale}`,
    }"
  >
    <transition name="fade">
      <div class="subtitles-content" v-if="state.currentText">
        {{ state.currentText }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  Live2DModelPosition,
  SubtitlesTransform,
} from "live2d-copilot-shared/src/Live2DModels";
import { PropType, reactive } from "vue";
import { sleep } from "../../utils/sleep";
import { useMoveable } from "./composables/useMoveable";

const emit = defineEmits<{
  (e: "update:transform", value: SubtitlesTransform): void;
}>();

const props = defineProps({
  modelPosition: {
    required: true,
    type: Object as PropType<Live2DModelPosition>,
  },
  transform: {
    type: Object as PropType<SubtitlesTransform>,
    default: () => {
      return new SubtitlesTransform();
    },
  },
});

const { moveableElRef } = useMoveable({
  getModelScale: () => props.modelPosition.relativeScale || 1,
  getTransform: () => props.transform,
  onUpdate: (newValue: SubtitlesTransform) =>
    emit("update:transform", newValue),
});

const state = reactive({
  currentText: "",
});

let lastTask: DisplayTask | null = null;

class DisplayTask {
  text: string;
  duration: number;
  canceled = false;
  constructor(text: string, duration: number) {
    this.text = text;
    this.duration = duration;
  }
  async play() {
    if (this.canceled) return;
    state.currentText = "";
    for (const word of this.text) {
      if (this.canceled) return;
      await sleep(this.duration / this.text.length);
      if (this.canceled) return;
      state.currentText += word;
    }
    await sleep(1000);
    if (this.canceled) return;
    state.currentText = "";
  }
  cancel() {
    this.canceled = true;
  }
}

async function push(text: string, duration: number) {
  lastTask?.cancel();
  lastTask = new DisplayTask(text, duration);
  lastTask.play();
}

async function clear() {
  state.currentText = "";
}

defineExpose({
  push,
  clear,
});
</script>

<style lang="scss" scoped>
.subtitles-wrapper {
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

.subtitles-content {
  background-color: var(--el-mask-color);
  border-radius: 6px;
  border: 2px thin var(--el-border-color);
  color: var(--el-text-color-primary);
  box-shadow: var(--el-box-shadow);
  font-size: 14px;
  padding: 6px 8px;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
text: string; duration: number; text: string; duration: number;

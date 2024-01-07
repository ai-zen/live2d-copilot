<template>
  <div class="auto-grid" ref="wrapperRef">
    <div
      class="auto-grid-internal"
      :style="{
        '--internal-padding': `${props.containerPadding}px`,
        '--cell-margin': `${props.cellMargin}px`,
      }"
      ref="internalRef"
    >
      <div
        class="cell"
        v-for="(item, index) of props.list"
        :key="item?.key || index"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  list: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  cellBaseWidth: {
    type: Number,
    default: 150,
  },
  containerPadding: {
    type: Number,
    default: 5,
  },
  cellMargin: {
    type: Number,
    default: 5,
  },
});

const wrapperRef = ref<null | HTMLDivElement>(null);
const internalRef = ref<null | HTMLDivElement>(null);

function onResize() {
  if (!wrapperRef.value) return;
  if (!internalRef.value) return;
  const wrapperWidth = wrapperRef.value.clientWidth;
  const containerWidth = wrapperWidth - props.containerPadding * 2;
  const cellWidth = props.cellBaseWidth + props.cellMargin * 2;
  const numberPerRow = Math.floor(containerWidth / cellWidth);
  const cellTargetWidth = Math.floor(containerWidth / numberPerRow - 10);
  internalRef.value.style.setProperty("--cell-width", `${cellTargetWidth}px`);
  internalRef.value.style.setProperty("width", `${wrapperWidth}px`);
}

const intersectionObserver = new IntersectionObserver((e) => {
  if (e[0]?.intersectionRatio) {
    requestAnimationFrame(onResize);
  }
});

const resizeObserver = new ResizeObserver((e) => {
  if (e[0]) {
    requestAnimationFrame(onResize);
  }
});

onMounted(() => {
  onResize();
  intersectionObserver.observe(wrapperRef.value!);
  resizeObserver.observe(wrapperRef.value!);
});

onUnmounted(() => {
  intersectionObserver.disconnect();
  resizeObserver.disconnect();
});
</script>

<style lang="scss" scoped>
.auto-grid {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}
.auto-grid-internal {
  display: flex;
  flex-wrap: wrap;
  padding: var(--internal-padding);
  .cell {
    margin: var(--cell-margin);
    width: var(--cell-width);
  }
}
</style>

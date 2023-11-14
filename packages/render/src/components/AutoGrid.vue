<template>
  <div
    class="auto-grid"
    :style="{
      '--container-padding': `${props.containerPadding}px`,
      '--cell-margin': `${props.cellMargin}px`,
    }"
    ref="containerRef"
  >
    <div
      class="cell"
      v-for="(item, index) of props.list"
      :key="item?.key || index"
    >
      <slot :item="item"></slot>
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

const containerRef = ref<null | HTMLDivElement>(null);

function onResize() {
  if (!containerRef.value) return;
  const cellWidth = props.cellBaseWidth + props.cellMargin * 2;
  const containerWidth =
    containerRef.value.clientWidth - props.containerPadding * 2;
  const numberPerRow = Math.floor(containerWidth / cellWidth);
  const cellTargetWidth = Math.floor(containerWidth / numberPerRow - 10);
  containerRef.value.style.setProperty("--cell-width", `${cellTargetWidth}px`);
}

const io = new IntersectionObserver((e) => {
  if (e[0]?.intersectionRatio) {
    onResize();
  }
});

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
  io.observe(containerRef.value!);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  io.disconnect();
});
</script>

<style lang="scss" scoped>
.auto-grid {
  display: flex;
  flex-wrap: wrap;
  padding: var(--container-padding);
  .cell {
    margin: var(--cell-margin);
    width: var(--cell-width);
  }
}
</style>

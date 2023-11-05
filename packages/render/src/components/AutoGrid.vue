<template>
  <div
    class="auto-grid"
    :style="{
      '--container-padding': `${props.containerPadding}px`,
      '--cell-margin': `${props.cellMargin}px`,
      '--cell-width': `${cellTargetWidth}px`,
    }"
    ref="listScrollContentRef"
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
import { PropType, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

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

const cellTargetWidth = ref(props.cellBaseWidth);
const listScrollContentRef = ref<null | HTMLDivElement>(null);

function onResize() {
  if (!listScrollContentRef.value) return;
  const cellWidth = props.cellBaseWidth + props.cellMargin * 2;
  const containerWidth =
    listScrollContentRef.value.clientWidth - props.containerPadding * 2;
  const numberPerRow = Math.floor(containerWidth / cellWidth);
  cellTargetWidth.value = containerWidth / numberPerRow - 10;
}

watch(
  () => props.list.length,
  async () => {
    await nextTick();
    onResize();
  }
);

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
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

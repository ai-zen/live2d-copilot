<template>
  <div
    v-if="visible"
    class="context-menu"
    :class="{ out: isClosing }"
    :style="{ '--left': `${x}px`, '--top': `${y}px` }"
  >
    <div class="ctx-bg" @click="close"></div>
    <div
      v-for="(item, i) in items"
      :key="i"
      class="ctx-item-wrap"
      :class="{ 'is-close': item.type === 'close' }"
      :style="{ '--index': i, '--count': items.length - 1 }"
      @click="handleClick(item)"
    >
      <div class="ctx-item" :title="item.label">
        <span class="ctx-icon">{{ item.icon }}</span>
        <span class="ctx-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface MenuItem {
  type?: string;
  label: string;
  icon: string;
  action?: () => void;
}

const props = defineProps<{
  items: MenuItem[];
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const visible = ref(true);
const isClosing = ref(false);

function close() {
  isClosing.value = true;
  setTimeout(() => {
    visible.value = false;
    emit("close");
  }, 400);
}

function handleClick(item: MenuItem) {
  item.action?.();
  close();
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  width: 260px;
  height: 260px;
  top: calc(var(--top) - 130px);
  left: calc(var(--left) - 130px);
  z-index: 9999;
  pointer-events: none;
}
.ctx-bg {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(20, 20, 40, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(16px);
  pointer-events: auto;
  animation: ctx-bg-in 0.35s ease-out both;
}
.out .ctx-bg {
  animation: ctx-bg-out 0.35s ease-in both;
}
.ctx-item-wrap {
  --item-size: 56px;
  position: absolute;
  width: var(--item-size);
  height: var(--item-size);
  top: calc((100% - var(--item-size)) * 0.5);
  left: calc((100% - var(--item-size)) * 0.5);
  transform-origin: 50% 50%;
  animation: ctx-item-in 0.4s ease-out both;
  pointer-events: auto;
}
.out .ctx-item-wrap {
  animation: ctx-item-out 0.35s ease-in both;
}
.ctx-item-wrap.is-close {
  animation: ctx-close-in 0.4s ease-out both;
}
.out .ctx-item-wrap.is-close {
  animation: ctx-close-out 0.35s ease-in both;
}
.ctx-item {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  transform: rotate(calc(-1 * var(--index) / var(--count) * 360deg));
}
.ctx-item:hover {
  background: rgba(74, 158, 255, 0.45);
  border-color: rgba(74, 158, 255, 0.85);
  box-shadow: 0 0 16px rgba(74, 158, 255, 0.35);
}
.ctx-icon {
  font-size: 20px;
  line-height: 1;
  color: #fff;
}
.ctx-label {
  font-size: 9px;
  color: #ccc;
  margin-top: 2px;
  line-height: 1;
  white-space: nowrap;
}
.ctx-item:hover .ctx-label {
  color: #fff;
}

@keyframes ctx-bg-in {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes ctx-bg-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0); }
}
@keyframes ctx-close-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ctx-close-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes ctx-item-in {
  from {
    transform: rotate(calc(var(--index) / var(--count) * 360deg + 90deg)) translateY(0px);
    opacity: 0;
  }
  to {
    transform: rotate(calc(var(--index) / var(--count) * 360deg)) translateY(-95px);
    opacity: 1;
  }
}
@keyframes ctx-item-out {
  from {
    transform: rotate(calc(var(--index) / var(--count) * 360deg)) translateY(-95px);
    opacity: 1;
  }
  to {
    transform: rotate(calc(var(--index) / var(--count) * 360deg + 90deg)) translateY(0px);
    opacity: 0;
  }
}
</style>

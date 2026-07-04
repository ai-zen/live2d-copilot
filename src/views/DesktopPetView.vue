<script setup lang="ts">
import { Live2D } from "@ai-zen/live2d-vue";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { onMounted, onUnmounted, ref } from "vue";

const live2dRef = ref<InstanceType<typeof Live2D>>();
let delegateRef: any = null;
let currentModelRef: any = null;

async function onLive2DReady() {
  console.log("[VPET] Live2D ready");
  const component = live2dRef.value as any;
  delegateRef = component?.delegateRef;
  const manager = component?.managerRef;
  if (manager) manager._enabledDrag = false;
  bindCanvasEvents();

  // 手动加载模型
  currentModelRef = await manager.changeModel("/models/Mao", "Mao.model3.json");
  console.log("[VPET] model loaded:", !!currentModelRef);

  // 监听 Rust 发来的全局鼠标坐标
  const unlisten = await listen<{ rel_x: number; rel_y: number }>("gaze-move", (ev) => {
    if (!delegateRef || !currentModelRef) return;
    const view = delegateRef._view;
    const m = currentModelRef.getModelMatrix();
    currentModelRef.setDragging(
      view.transformViewX(ev.payload.rel_x) - m.getTranslateX(),
      view.transformViewY(ev.payload.rel_y) - m.getTranslateY()
    );
  });
  console.log("[VPET] gaze listener registered");
}

// ==========================================
// Canvas 事件（滚轮缩放）
// ==========================================

let canvasEl: HTMLCanvasElement | null = null;

function bindCanvasEvents() {
  canvasEl = document.querySelector(".live2d-canvas canvas") as HTMLCanvasElement;
  if (!canvasEl) return;
  canvasEl.addEventListener("wheel", onWheel);
}

function unbindCanvasEvents() {
  if (!canvasEl) return;
  canvasEl.removeEventListener("wheel", onWheel);
}

function onWheel(ev: WheelEvent) {
  if (!currentModelRef || ev.deltaY === 0) return;
  const m = currentModelRef.getModelMatrix();
  if (ev.deltaY > 0) {
    if (m.getScaleX() > 0.1) m.scale(m.getScaleX() - 0.05, m.getScaleY() - 0.05);
  } else {
    if (m.getScaleX() < 1.5) m.scale(m.getScaleX() + 0.05, m.getScaleY() + 0.05);
  }
}

// ==========================================
// 窗口拖动
// ==========================================

const DRAG_THRESHOLD = 5;
let mouseDownPos: { x: number; y: number } | null = null;
let isDragging = false;

function onDocMouseDown(ev: MouseEvent) {
  mouseDownPos = { x: ev.clientX, y: ev.clientY };
  isDragging = false;
}
function onDocMouseMove(ev: MouseEvent) {
  if (!mouseDownPos || isDragging) return;
  if (Math.abs(ev.clientX - mouseDownPos.x) > DRAG_THRESHOLD || Math.abs(ev.clientY - mouseDownPos.y) > DRAG_THRESHOLD) {
    isDragging = true;
    mouseDownPos = null;
    invoke("drag_window");
  }
}
function onDocMouseUp() {
  mouseDownPos = null;
}

onMounted(() => {
  invoke("close_loading_window");
  document.addEventListener("mousedown", onDocMouseDown);
  document.addEventListener("mousemove", onDocMouseMove);
  document.addEventListener("mouseup", onDocMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onDocMouseDown);
  document.removeEventListener("mousemove", onDocMouseMove);
  document.removeEventListener("mouseup", onDocMouseUp);
  unbindCanvasEvents();
});
</script>

<template>
  <div class="desktop-pet-container">
    <Live2D
      ref="live2dRef"
      class="live2d-canvas"
      model-dir=""
      model-name=""
      @ready="onLive2DReady"
    />
  </div>
</template>

<style scoped>
.desktop-pet-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: transparent;
}
.live2d-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}
.live2d-canvas:active {
  cursor: grabbing;
}
</style>

import { onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

/**
 * 窗口拖动。
 * 只关心：监听鼠标事件，超过阈值调用原生拖动。
 */
export function useDrag(threshold = 5) {
  let start: { x: number; y: number } | null = null;
  let dragging = false;

  function onDown(e: MouseEvent) { start = { x: e.clientX, y: e.clientY }; dragging = false; }
  function onMove(e: MouseEvent) {
    if (!start || dragging) return;
    if (Math.abs(e.clientX - start.x) > threshold || Math.abs(e.clientY - start.y) > threshold) {
      dragging = true; start = null;
      invoke("drag_window");
    }
  }
  function onUp() { start = null; }

  onMounted(() => {
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
  onUnmounted(() => {
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  });
}

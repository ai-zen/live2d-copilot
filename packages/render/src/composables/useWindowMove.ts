import { onMounted, onUnmounted } from "vue";

/**
 * Enable window movement
 */
export function useWindowMove(winApi: {
  startWindowMove(): void;
  endWindowMove(): void;
}) {
  function onMouseDown(_event: MouseEvent) {
    winApi.startWindowMove();
  }

  function onMouseUp(_event: MouseEvent) {
    winApi.endWindowMove();
  }

  onMounted(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
  });

  onUnmounted(() => {
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
  });
}

import {
  MoveableTransform,
  SubtitlesTransform,
} from "live2d-copilot-shared/src/Live2DModels";
import { ref, reactive, onMounted, onUnmounted } from "vue";

export function useMoveable({
  getTransform,
  getModelScale,
  onUpdate,
}: {
  getTransform(): MoveableTransform;
  getModelScale(): number;
  onUpdate(newValue: MoveableTransform): void;
}) {
  const moveableElRef = ref<null | HTMLDivElement>(null);

  const offsetMoveState = reactive({
    isMoving: false,
    beginTransform: new SubtitlesTransform(),
    beginEv: { clientX: 0, clientY: 0 },
  });

  function onMouseDown(ev: MouseEvent) {
    offsetMoveState.isMoving = true;
    offsetMoveState.beginTransform = getTransform();
    offsetMoveState.beginEv = { clientX: ev.clientX, clientY: ev.clientY };
  }

  function onMouseMove(ev: MouseEvent) {
    if (!offsetMoveState.isMoving) return;
    const deltaX = ev.clientX - offsetMoveState.beginEv.clientX;
    const deltaY = ev.clientY - offsetMoveState.beginEv.clientY;
    const modelScale = getModelScale();
    onUpdate({
      offsetX: offsetMoveState.beginTransform.offsetX + deltaX / modelScale,
      offsetY: offsetMoveState.beginTransform.offsetY + deltaY / modelScale,
      scale: offsetMoveState.beginTransform.scale,
    });
  }

  function onMouseUp() {
    if (!offsetMoveState.isMoving) return;
    offsetMoveState.isMoving = false;
  }

  // Event handling function for wheel scroll.
  function onWheel(ev: WheelEvent) {
    const transform = getTransform();
    let scale = transform.scale;
    if (ev.deltaY > 0) {
      if (scale > 0.5) {
        scale -= 0.05;
      }
    } else {
      if (scale < 2) {
        scale += 0.05;
      }
    }
    onUpdate({
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
      scale: scale,
    });
  }

  onMounted(() => {
    moveableElRef.value?.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    moveableElRef.value?.addEventListener("wheel", onWheel);
  });

  onUnmounted(() => {
    moveableElRef.value?.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    moveableElRef.value?.removeEventListener("wheel", onWheel);
  });

  return {
    moveableElRef,
  };
}

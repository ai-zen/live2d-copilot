import {
  LAppLive2DManagerModule,
  LAppModelModule,
  LAppProfileModule,
  LAppDelegateModule,
} from "@ai-zen/live2d-vue";
import type { Methods } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { ShallowRef, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { toLocalURI } from "../../../utils/toLocalURI";
import { rpc } from "../../../modules/rpc";

/**
 * Custom hook for managing the current model.
 * @param winApi - Window API object for obtaining the current Live2D model information.
 * @param managerRef - Shallow reference to the Live2D manager.
 * @returns loadCurrentModel - Asynchronous function for loading the current model.
 * @returns currentModelRef - Reference to the current model.
 * @returns currentModelProfileRef - Reference to the profile of the current model.
 * @returns managerRef - Reference to the manager.
 */
export function useCurrentModel({
  winApi,
  managerRef,
  delegateRef,
}: {
  winApi: Methods;
  managerRef: ShallowRef<LAppLive2DManagerModule.LAppLive2DManager | null>;
  delegateRef: ShallowRef<LAppDelegateModule.LAppDelegate | null>;
}) {
  // Reference to the current model.
  const currentModelRef = shallowRef<LAppModelModule.LAppModel | null>(null);

  // Reference to the profile of the current model.
  const currentModelProfileRef = ref<LAppProfileModule.LAppProfile | null>(
    null
  );

  /**
   * Asynchronous function for loading the current model.
   */
  async function loadCurrentModel() {
    if (!managerRef.value) return;

    let pathInfo = await winApi.getCurrentLive2DModel();
    if (!pathInfo) return;

    // Change the model.
    currentModelRef.value = await managerRef.value.changeModel(
      toLocalURI(pathInfo.modelDir),
      pathInfo.modelFileName
    );

    // Adjust the model size.
    const targetModelSize = 860;
    const targetScale = targetModelSize / window.innerHeight;
    currentModelRef.value.getModelMatrix().scale(targetScale, targetScale);

    // Load the profile of the model.
    currentModelProfileRef.value =
      await currentModelRef.value._profileManager.loadProfile();
  }

  // Event handling function for mouse down.
  let beginEv: MouseEvent | null = null;
  let beginTranslateX: number;
  let beginTranslateY: number;
  function onMouseDown(this: HTMLCanvasElement, ev: MouseEvent) {
    const modelMatrix = currentModelRef.value?.getModelMatrix();
    if (!modelMatrix) return;
    // Record the initial position.
    beginEv = ev;
    beginTranslateX = modelMatrix.getTranslateX();
    beginTranslateY = modelMatrix.getTranslateY();
  }

  // Event handling function for mouse move.
  function onMouseMove(this: HTMLCanvasElement, ev: MouseEvent) {
    if (!beginEv) return;
    if (!delegateRef.value) return;
    if (!currentModelRef.value) return;
    const view = delegateRef.value._view;
    const modelMatrix = currentModelRef.value.getModelMatrix();
    // Calculate the offset of mouse movement and update the model position.
    const eventViewX = view.transformViewX(ev.clientX * devicePixelRatio);
    const eventViewY = view.transformViewY(ev.clientY * devicePixelRatio);
    const beginViewX = view.transformViewX(beginEv.clientX * devicePixelRatio);
    const beginViewY = view.transformViewY(beginEv.clientY * devicePixelRatio);
    const offsetX = eventViewX - beginViewX;
    const offsetY = eventViewY - beginViewY;
    modelMatrix.translateX(beginTranslateX + offsetX);
    modelMatrix.translateY(beginTranslateY + offsetY);
  }

  // Event handling function for mouse up.
  function onMouseUp(this: HTMLCanvasElement, _ev: MouseEvent) {
    beginEv = null;
  }

  // Event handling function for wheel scroll.
  function onWheel(this: Window, ev: WheelEvent) {
    if (!currentModelRef.value) return;
    if (ev.deltaY == 0) return;
    const modelMatrix = currentModelRef.value.getModelMatrix();
    const scaleX = modelMatrix.getScaleX();
    const scaleY = modelMatrix.getScaleY();
    // Scale the model based on the direction of the wheel scroll.
    if (ev.deltaY > 0) {
      if (scaleX > 0.1 && scaleY > 0.1) {
        modelMatrix.scale(scaleX - 0.05, scaleY - 0.05);
      }
    } else {
      if (scaleX < 1.5 && scaleY < 1.5) {
        modelMatrix.scale(scaleX + 0.05, scaleY + 0.05);
      }
    }
  }

  // Handle System mouse move event
  rpc.register({
    onSystemMouseMoveEvent(
      point: { x: number; y: number },
      winRect: { x: number; y: number; w: number; h: number }
    ) {
      if (!delegateRef.value || !currentModelRef.value) return;
      const modelMatrix = currentModelRef.value.getModelMatrix();
      const viewX = delegateRef.value._view.transformViewX(point.x - winRect.x);
      const viewY = delegateRef.value._view.transformViewY(point.y - winRect.y);
      // Let the model gaze follow the mouse.
      currentModelRef.value.setDragging(
        viewX - modelMatrix.getTranslateX(),
        viewY - modelMatrix.getTranslateY()
      );
    },
  });

  // Bind event listeners.
  let el: HTMLCanvasElement | null;
  onMounted(() => {
    el = document.querySelector(".live2d");
    if (!el) return;
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    window.addEventListener("wheel", onWheel);
  });

  // Unbind event listeners.
  onUnmounted(() => {
    if (!el) return;
    el.removeEventListener("mousedown", onMouseDown);
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("wheel", onWheel);
  });

  return {
    loadCurrentModel,
    currentModelRef,
    currentModelProfileRef,
    managerRef,
  };
}

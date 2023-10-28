import {
  LAppLive2DManagerModule,
  LAppModelModule,
  LAppProfileModule,
} from "@ai-zen/live2d-vue";
import type { CallRecord } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { ShallowRef, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { toLocalURI } from "../../../utils/toLocalURI";

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
}: {
  winApi: CallRecord;
  managerRef: ShallowRef<LAppLive2DManagerModule.LAppLive2DManager | null>;
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
    const modelMatrix = currentModelRef.value?.getModelMatrix();
    if (!modelMatrix) return;
    // Calculate the offset of mouse movement and update the model position.
    const offsetX = ev.clientX - beginEv.clientX;
    const offsetY = ev.clientY - beginEv.clientY;
    modelMatrix.translateX(beginTranslateX + offsetX * 0.0014); // TODO: Change this bad code.
    modelMatrix.translateY(beginTranslateY + -offsetY * 0.0014);
  }

  // Event handling function for mouse up.
  function onMouseUp(this: HTMLCanvasElement, ev: MouseEvent) {
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

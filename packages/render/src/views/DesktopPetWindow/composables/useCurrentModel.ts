import {
  LAppDelegateModule,
  LAppLive2DManagerModule,
  LAppModelModule,
} from "@ai-zen/live2d-vue";
import type { Methods } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import {
  Live2DModelPosition,
  Live2DModelProfileEx,
  ModelTransform,
} from "live2d-copilot-shared/src/Live2DModels";
import { ShallowRef, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { rpc } from "../../../modules/rpc";
import { toLocalURI } from "../../../utils/toLocalURI";
import { debounce } from "../../../utils/debounce";

const TARGET_MODEL_SIZE = 860;

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
  const currentModelProfileRef = ref<Live2DModelProfileEx | null>(null);

  // Live2D model position reference.
  const currentModelPositionRef = ref<Live2DModelPosition | null>(null);

  function getDefaultScale() {
    return TARGET_MODEL_SIZE / Math.min(window.innerHeight, window.innerWidth);
  }

  /**
   * Record the current model position.
   */
  function recordModelPosition() {
    if (!currentModelRef.value) return;
    if (!delegateRef.value) return;
    const view = delegateRef.value._view;
    const matrix = currentModelRef.value.getModelMatrix();
    const scaleX = matrix.getScaleX();
    const scaleY = matrix.getScaleY();
    const viewX = matrix.getTranslateX();
    const viewY = matrix.getTranslateY();
    const screenX = view._viewMatrix.transformX(viewX);
    const screenY = view._viewMatrix.transformY(viewY);
    const deviceX = Math.round(view._deviceToScreen.invertTransformX(screenX));
    const deviceY = Math.round(view._deviceToScreen.invertTransformY(screenY));
    const centerDeviceX = deviceX - innerWidth / 2;
    const centerDeviceY = deviceY - innerHeight / 2;
    const relativeScale = scaleX / getDefaultScale();
    currentModelPositionRef.value = {
      relativeScale,
      scaleX,
      scaleY,
      viewX,
      viewY,
      screenX,
      screenY,
      deviceX,
      deviceY,
      centerDeviceX,
      centerDeviceY,
    };
  }

  /**
   * Save the current model transform.
   */
  function saveModelTransform() {
    if (!currentModelProfileRef.value) return;
    if (!currentModelPositionRef.value) return;

    // Set ModelTransform now.
    currentModelProfileRef.value.ModelTransform = new ModelTransform();
    currentModelProfileRef.value.ModelTransform.Scale =
      currentModelPositionRef.value?.relativeScale;
    currentModelProfileRef.value.ModelTransform.OffsetX =
      currentModelPositionRef.value?.centerDeviceX;
    currentModelProfileRef.value.ModelTransform.OffsetY =
      currentModelPositionRef.value?.centerDeviceY;

    // Save later.
    saveProfileWithDebounce();
  }

  /**
   * Asynchronous function for loading the current model.
   */
  async function loadCurrentModel() {
    if (!managerRef.value) return;
    if (!delegateRef.value) return;

    // Load the profile of the model.
    const profile = await winApi.getCurrentProfile();
    if (!profile) return;
    currentModelProfileRef.value = profile;

    // The matrix info of prev model.
    let prevMatrix: Float32Array | null = null;
    if (currentModelRef.value) {
      // Get the matrix info of prev model.
      prevMatrix = currentModelRef.value.getModelMatrix().getArray();
    }

    // Change the model.
    currentModelRef.value = await managerRef.value.changeModel(
      toLocalURI(profile._ModelDir),
      profile._ModelFileName
    );

    // If there is an prev model matrix
    if (prevMatrix) {
      // Using the prev model matrix.
      currentModelRef.value.getModelMatrix().setMatrix(prevMatrix);
    }

    // Adjust the model size.
    const relativeScale = profile.ModelTransform?.Scale || 1;
    const targetScale = getDefaultScale() * relativeScale;
    currentModelRef.value.getModelMatrix().scale(targetScale, targetScale);

    // Sync current model client position.
    recordModelPosition();
  }

  /**
   * Save the profile of the model.
   */
  async function saveCurrentModelProfile() {
    if (!currentModelProfileRef.value) return;
    console.log("saveCurrentModelProfile");
    await winApi.saveProfile(
      currentModelProfileRef.value._ModelDir,
      JSON.parse(JSON.stringify(currentModelProfileRef.value))
    );
  }

  /**
   * Save the profile of the model (With debounce 300ms).
   */
  const saveProfileWithDebounce = debounce(saveCurrentModelProfile, 300);

  // Event handling function for mouse down.
  let beginEv: { clientX: number; clientY: number } | null = null;
  let beginTranslateX: number;
  let beginTranslateY: number;
  function onMouseDown(this: HTMLCanvasElement, ev: MouseEvent) {
    const modelMatrix = currentModelRef.value?.getModelMatrix();
    if (!modelMatrix) return;
    // Record the initial position.
    beginEv = { clientX: ev.clientX, clientY: ev.clientY };
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
    const eventViewX = view.transformViewX(ev.clientX);
    const eventViewY = view.transformViewY(ev.clientY);
    const beginViewX = view.transformViewX(beginEv.clientX);
    const beginViewY = view.transformViewY(beginEv.clientY);
    const deltaX = eventViewX - beginViewX;
    const deltaY = eventViewY - beginViewY;
    modelMatrix.translateX(beginTranslateX + deltaX);
    modelMatrix.translateY(beginTranslateY + deltaY);

    // Record current model client position.
    recordModelPosition();

    // Save the current model transform.
    saveModelTransform();
  }

  // Event handling function for mouse up.
  function onMouseUp(this: HTMLCanvasElement, _ev: MouseEvent) {
    if (!beginEv) return;
    beginEv = null;
  }

  // Event handling function for wheel scroll.
  function onWheel(this: HTMLCanvasElement, ev: WheelEvent) {
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

    // Sync current model client position.
    recordModelPosition();

    // Save the current model transform.
    saveModelTransform();
  }

  // Handle System mouse move event
  const methods = rpc.register({
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

  onUnmounted(() => {
    rpc.deregister(methods);
  });

  // Bind event listeners.
  let el: HTMLCanvasElement | null;
  onMounted(() => {
    el = document.querySelector(".live2d");
    if (!el) return;
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("wheel", onWheel);
  });

  // Unbind event listeners.
  onUnmounted(() => {
    if (!el) return;
    el.removeEventListener("mousedown", onMouseDown);
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseup", onMouseUp);
    el.removeEventListener("wheel", onWheel);
  });

  return {
    loadCurrentModel,
    saveCurrentModelProfile,
    saveProfileWithDebounce,
    currentModelRef,
    currentModelProfileRef,
    currentModelPositionRef,
    managerRef,
  };
}

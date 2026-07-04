import { ref } from "vue";
import { listen } from "@tauri-apps/api/event";

/**
 * Live2D 模型管理 & 视线追踪。
 * 只关心：加载模型、接收全局鼠标事件、更新视线。
 */
export function useLive2D() {
  const delegate = ref<any>(null);
  const model = ref<any>(null);

  async function load(manager: any, modelDir: string, modelFileName: string) {
    delegate.value = manager._delegate;
    model.value = await manager.changeModel(modelDir, modelFileName);
  }

  async function startGazeTracking() {
    await listen<{ rel_x: number; rel_y: number }>("gaze-move", (event) => {
      if (!delegate.value || !model.value) return;
      const view = delegate.value._view;
      const matrix = model.value.getModelMatrix();
      model.value.setDragging(
        view.transformViewX(event.payload.rel_x) - matrix.getTranslateX(),
        view.transformViewY(event.payload.rel_y) - matrix.getTranslateY()
      );
    });
  }

  return { delegate, model, load, startGazeTracking };
}

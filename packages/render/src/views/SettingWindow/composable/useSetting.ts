import type {
  Setting,
  SettingMethodsByMain,
} from "live2d-copilot-shared/src/Setting";
import { nextTick, reactive, watch } from "vue";
import { rpc } from "../../../modules/rpc";

export function useSetting() {
  const winApi = rpc.use<SettingMethodsByMain>("setting");

  const settingState = reactive({
    isLoading: true,
    isReady: false,
    isSaving: false,
    data: null as Setting | null,
  });

  async function getSetting() {
    try {
      settingState.isLoading = true;
      settingState.data = await winApi.getSetting();
      settingState.isReady = true;
    } catch (error: any) {
      console.error(
        `Failed to get settings: ${error?.message || "unknown error"}`
      );
    } finally {
      await nextTick();
      settingState.isLoading = false;
    }
  }

  async function setSetting() {
    try {
      settingState.isSaving = true;
      await winApi.setSetting(JSON.parse(JSON.stringify(settingState.data)));
    } catch (error: any) {
      console.error(
        `Failed to set settings: ${error?.message || "unknown error"}`
      );
    } finally {
      await nextTick();
      settingState.isSaving = false;
    }
  }

  watch(
    () => settingState.data,
    () => {
      if (!settingState.isLoading) {
        setSetting();
      }
    },
    {
      deep: true,
    }
  );

  getSetting();

  return {
    settingState,
    getSetting,
    setSetting,
  };
}

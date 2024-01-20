import EventBus from "@ai-zen/event-bus";
import {
  Setting,
  SettingMethodsByMain,
  SettingMethodsByRender,
} from "live2d-copilot-shared/src/Setting";
import { SimpleI18n } from "live2d-copilot-shared/src/classes/SimpleI18n";
import en from "live2d-copilot-shared/src/locales/en.json";
import zh from "live2d-copilot-shared/src/locales/zh.json";
import { reactive } from "vue";
import { rpc } from "../modules/rpc";

export class RenderSimpleI18n extends SimpleI18n {
  static instance = new RenderSimpleI18n({
    lang: "en",
    fallbackLang: "en",
    locales: {
      en,
      zh,
    },
  });

  eventBus = new EventBus();

  constructor(initState: SimpleI18n["state"]) {
    super(reactive(initState) as SimpleI18n["state"]);
  }

  async init() {
    rpc.register<SettingMethodsByRender>("setting", {
      // When the lang option in the settings is changed.
      onSettingChange: (newSetting: Setting) => {
        console.log("[i18n.ts] onSettingChange", newSetting);
        // Change the lang of the i18n module.
        this.setLang(newSetting.lang);
      },
    });

    // Get setting.
    const setting = await rpc.use<SettingMethodsByMain>("setting").getSetting();
    // Change lang
    this.setLang(setting.lang);
  }

  setLang(lang: string) {
    this.state.lang = lang;
    this.eventBus.emit("langChange", lang);
  }

  setLocales(locale: SimpleI18n["state"]["locales"]) {
    this.state.locales = locale;
    this.eventBus.emit("localesChange", locale);
  }
}

export const i18n = RenderSimpleI18n.instance;

export function useI18n() {
  return {
    t: i18n.t.bind(i18n),
  };
}

import EventBus from "@ai-zen/event-bus";
import { SimpleI18n } from "live2d-copilot-shared/src/classes/SimpleI18n";
import en from "live2d-copilot-shared/src/locales/en.json";
import zh from "live2d-copilot-shared/src/locales/zh.json";
import { reactive, watch } from "vue";
import { settingManager } from "./setting";

export class RenderSimpleI18n extends SimpleI18n {
  static instance = new RenderSimpleI18n({
    lang: localStorage.getItem("lang") || "en",
    fallbackLang: "en",
    locales: {
      en,
      zh,
    },
  });

  eventBus = new EventBus();

  private constructor(initState: SimpleI18n["state"]) {
    super(reactive(initState) as SimpleI18n["state"]);

    watch(
      () => settingManager.state.data?.lang,
      (newLang) => {
        if (newLang) this.setLang(newLang);
      },
      { immediate: true }
    );
  }

  setLang(lang: string) {
    this.state.lang = lang;
    this.eventBus.emit("langChange", lang);
    localStorage.setItem("lang", lang);
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

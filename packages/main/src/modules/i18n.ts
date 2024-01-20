import EventBus from "@ai-zen/event-bus";
import { Setting } from "live2d-copilot-shared/src/Setting";
import { SimpleI18n } from "live2d-copilot-shared/src/classes/SimpleI18n";
import en from "live2d-copilot-shared/src/locales/en.json";
import zh from "live2d-copilot-shared/src/locales/zh.json";
import { settingManager } from "./settingManager";

export class MainSimpleI18n extends SimpleI18n {
  static instance = new MainSimpleI18n({
    lang: "en",
    fallbackLang: "en",
    locales: {
      en,
      zh,
    },
  });

  eventBus = new EventBus();

  private constructor(initState: SimpleI18n["state"]) {
    super(initState as SimpleI18n["state"]);
  }

  async init() {
    // When the lang option in the settings is changed.
    settingManager.eventBus.on("change", (newSetting: Setting) => {
      // Change lang
      this.setLang(newSetting.lang);
    });

    // Get setting.
    const setting = await settingManager.getSetting();
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

export const i18n = MainSimpleI18n.instance;

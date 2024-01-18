import { VueSimpleI18n } from "../classes/VueSimpleI18n";
import en from "live2d-copilot-shared/src/locales/en.json";
import zh from "live2d-copilot-shared/src/locales/zh.json";

export const i18n = new VueSimpleI18n({
  lang: "en",
  fallbackLang: "en",
  locales: {
    en,
    zh,
  },
});

export function useI18n() {
  return {
    t: i18n.t.bind(i18n),
  };
}

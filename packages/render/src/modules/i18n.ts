import { SimpleI18n } from "../classes/SimpleI18n";
import en from "../locales/en.json";
import zh from "../locales/zh.json";

export const i18n = new SimpleI18n({
  lang: "zh",
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

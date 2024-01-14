import { reactive } from "vue";

export class SimpleI18n {
  state: {
    lang: string;
    fallbackLang: string;
    locales: Record<string, Record<string, any>>;
  };

  constructor(initState: SimpleI18n["state"]) {
    this.state = reactive(initState);
  }

  static getValueByPath(obj: any, path: string) {
    const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    return keys.reduce((value, key) => {
      if (value && typeof value === "object") {
        return value[key];
      } else {
        return undefined;
      }
    }, obj);
  }

  static evalTemplate(template: string, ...args: any[]) {
    if (args.length === 1 && typeof args[0] === "object") {
      const keys = Object.keys(args[0]);
      const values = Object.values(args[0]) as string[];
      return template.replace(/{\w+}/g, (match) => {
        const key = match.slice(1, -1);
        const index = keys.indexOf(key);
        return index !== -1 ? values[index] : match;
      });
    } else {
      return template.replace(/{\d+}/g, (match) => {
        const index = parseInt(match.slice(1, -1));
        return index >= 0 && index < args.length ? args[index] : match;
      });
    }
  }

  public t(key: string, obj?: Record<string, any>): string;
  public t(key: string, ...args: any[]): string;
  public t(key: string, ...args: any[]): string {
    const state = this.state;
    const primaryLocale = state.locales[state.lang];
    const fallbackLocale = state.locales[state.fallbackLang];
    if (!primaryLocale && !fallbackLocale) return key;
    let template =
      SimpleI18n.getValueByPath(primaryLocale, key) ??
      SimpleI18n.getValueByPath(fallbackLocale, key);
    if (!template) return key;
    return SimpleI18n.evalTemplate(template, ...args) ?? key;
  }
}

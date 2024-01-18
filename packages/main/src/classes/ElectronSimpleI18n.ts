import EventBus from "@ai-zen/event-bus";
import { SimpleI18n } from "live2d-copilot-shared/src/classes/SimpleI18n";

export class ElectronSimpleI18n extends SimpleI18n {
  eventBus = new EventBus();
  constructor(initState: SimpleI18n["state"]) {
    super(initState as SimpleI18n["state"]);
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

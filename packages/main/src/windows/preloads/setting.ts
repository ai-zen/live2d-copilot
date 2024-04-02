import { BrowserWindowEx } from "../../classes/BrowserWindowEx";
import { settingManager } from "../../modules/settingManager";

export function preload(win: BrowserWindowEx) {
  return win.rpc.register("setting", {
    getSetting: settingManager.getSetting.bind(settingManager),
    setSetting: settingManager.setSetting.bind(settingManager),
  });
}

export type Methods = ReturnType<typeof preload>;

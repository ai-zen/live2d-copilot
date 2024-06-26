import { BrowserWindowEx } from "../../classes/BrowserWindowEx";
import { chatToolsManager } from "../../modules/chatToolsManager";

export function preload(win: BrowserWindowEx) {
  return win.rpc.register("chatTools", {
    getLoadedProfiles:
      chatToolsManager.getLoadedProfiles.bind(chatToolsManager),
    getFunctionCallResult:
      chatToolsManager.getFunctionCallResult.bind(chatToolsManager),
  });
}

export type Methods = ReturnType<typeof preload>;

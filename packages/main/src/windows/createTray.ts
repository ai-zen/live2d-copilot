import { Menu, Tray, app } from "electron";
import path from "node:path";
import { createModelsWindow } from "./createModelsWindow";
import { createPluginsWindow } from "./createPluginsWindow";
import { createSettingWindow } from "./createSettingWindow";

export function createTray() {
  const tray = new Tray(path.resolve(__dirname, "logo.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "模型",
      click() {
        createModelsWindow();
      },
    },
    {
      label: "插件",
      click() {
        createPluginsWindow();
      },
    },
    {
      label: "设置",
      click() {
        createSettingWindow();
      },
    },
    {
      label: "退出",
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);
}

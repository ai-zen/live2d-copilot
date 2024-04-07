import { Menu, Tray, app } from "electron";
import path from "node:path";
import { createModelsWindow } from "./createModelsWindow";
import { createPluginsWindow } from "./createPluginsWindow";
import { createSettingWindow } from "./createSettingWindow";
import { i18n } from "../modules/i18n";

export function createTray() {
  const tray = new Tray(path.resolve(__dirname, "logo.png"));

  function updateTray() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: i18n.t("tray.models"),
        click() {
          createModelsWindow();
        },
      },
      {
        label: i18n.t("tray.plugins"),
        click() {
          createPluginsWindow();
        },
      },
      {
        label: i18n.t("tray.settings"),
        click() {
          createSettingWindow();
        },
      },
      {
        label: i18n.t("tray.exit"),
        click() {
          app.quit();
        },
      },
    ]);

    tray.setToolTip("Live2D Copilot");
    tray.setContextMenu(contextMenu);
  }

  updateTray();

  i18n.eventBus.on("lang-change", updateTray);
}

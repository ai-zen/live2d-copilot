import type { BrowserWindowConstructorOptions, IpcMainEvent } from "electron";
import { BrowserWindow } from "electron";
import path from "path";
import { WebMessageRPC } from "web-message-rpc";
import EventBus from "@ai-zen/event-bus";
import { logger, withBigint } from "../modules/logger";

export interface BrowserWindowExConstructorOptions
  extends BrowserWindowConstructorOptions {
  name: string;
}

export class BrowserWindowEx extends BrowserWindow {
  rpc: WebMessageRPC<any>;
  name: string;

  private constructor(options: BrowserWindowExConstructorOptions) {
    super(options);
    let handle: (_event: IpcMainEvent, payload: any) => void;
    this.name = options.name;
    this.rpc = new WebMessageRPC(
      {
        addEventListener: (callback) => {
          handle = (_event, payload) => {
            if (payload.method) {
              logger.info(
                `${this.name} received: ${JSON.stringify(payload, withBigint)}`
              );
            }
            callback(payload);
          };
          this.webContents.ipc.on("rpc-event", handle);
        },
        removeEventListener: (_callback) => {
          this.webContents.ipc.off("rpc-event", handle);
        },
        postMessage: (payload) => {
          if (payload.method != "onSystemMouseMoveEvent") {
            logger.info(
              `${this.name} sending: ${JSON.stringify(payload, withBigint)}`
            );
          }
          this.webContents.send("rpc-event", payload);
        },
      },
      {}
    );
    this.on("close", () => {
      this.rpc.destroy();
    });
  }

  static instanceMap = new Map<string, BrowserWindowEx>();
  static events = new EventBus();

  static getWin(options: {
    title?: string;
    name?: string;
  }): BrowserWindowEx | null {
    let win: BrowserWindowEx | null = null;
    BrowserWindowEx.instanceMap.forEach((value) => {
      if (options.title && value.title == options.title) win = value;
      if (options.name && value.name == options.name) win = value;
    });
    return win;
  }

  static create(
    url: string,
    options: BrowserWindowExConstructorOptions,
    /**
     * Whether to allow window duplication
     */
    allowDuplicates = false
  ) {
    // Prevent window duplication
    if (!allowDuplicates && BrowserWindowEx.instanceMap.has(url)) {
      const lastWin = BrowserWindowEx.instanceMap.get(url)!;
      lastWin.show();
      return null;
    }

    const win = new BrowserWindowEx({
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      ...options,
    });

    // Record window instance
    BrowserWindowEx.instanceMap.set(url, win);
    BrowserWindowEx.events.emit("create", win);

    win.on("close", () => {
      // Remove window instance.
      BrowserWindowEx.instanceMap.delete(url);
      BrowserWindowEx.events.emit("close", win);
    });

    win.loadURL(url);

    if (
      process.env.BUILD_MODE == "development" ||
      process.env.BUILD_MODE == "prerelease"
    ) {
      win.webContents.openDevTools({ mode: "undocked", activate: false });
    }

    return win;
  }
}

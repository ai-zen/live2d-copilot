import type { BrowserWindowConstructorOptions, IpcMainEvent } from "electron";
import { BrowserWindow } from "electron";
import { WebMessageRPC } from "web-message-rpc";

export interface BrowserWindowExConstructorOptions
  extends BrowserWindowConstructorOptions {
  name: string;
}

export class BrowserWindowEx extends BrowserWindow {
  rpc: WebMessageRPC<any>;
  name: string;

  constructor(options: BrowserWindowExConstructorOptions) {
    super(options);
    let handel: (_event: IpcMainEvent, payload: any) => void;
    this.name = options.name;
    this.rpc = new WebMessageRPC(
      {
        addEventListener: (callback) => {
          handel = (_event, payload) => {
            callback(payload);
          };
          this.webContents.ipc.on("rpc-event", handel);
        },
        removeEventListener: (callback) => {
          this.webContents.ipc.off("rpc-event", handel);
        },
        postMessage: (payload) => {
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
}

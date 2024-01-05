import type { BrowserWindowConstructorOptions, IpcMainEvent } from "electron";
import { BrowserWindow } from "electron";
import path from "path";
import { WebMessageRPC } from "web-message-rpc";

export interface BrowserWindowExConstructorOptions
  extends BrowserWindowConstructorOptions {
  name: string;
}

export class BrowserWindowEx extends BrowserWindow {
  rpc: WebMessageRPC<any>;
  name: string;

  private constructor(options: BrowserWindowExConstructorOptions) {
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
        removeEventListener: (_callback) => {
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

    // Mark the window as open
    BrowserWindowEx.instanceMap.set(url, win);

    win.on("close", () => {
      // Mark the window as closed
      BrowserWindowEx.instanceMap.delete(url);
    });

    win.loadURL(url);

    if (
      process.env.BUILD_MODE == "development" ||
      process.env.BUILD_MODE == "prerelease"
    ) {
      win.webContents.openDevTools({ mode: "undocked" });
    }

    return win;
  }
}

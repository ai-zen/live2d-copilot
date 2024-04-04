import EventBus from "@ai-zen/event-bus";
import { BrowserWindowEx } from "../classes/BrowserWindowEx";

export class MainBroadcaster extends EventBus {
  static instance = new MainBroadcaster();

  private constructor() {
    super();

    BrowserWindowEx.events.on("create", (win) => {
      this.add(win);
    });

    BrowserWindowEx.events.on("close", (win) => {
      this.remove(win);
    });
  }

  private targets: Set<BrowserWindowEx> = new Set();

  add(win: BrowserWindowEx) {
    this.targets.add(win);
    win.rpc.register("broadcaster", {
      broadcast: (event: string, ...args: any[]) => {
        this.broadcast(event, ...args);
      },
    });
  }

  remove(win: BrowserWindowEx) {
    this.targets.delete(win);
    win.rpc.deregister("broadcaster", { broadcast() {} });
  }

  broadcast(event: string, ...args: any[]) {
    this.emit(event, ...args);
    this.targets.forEach((win) => {
      win.rpc.use("broadcaster").emit(event, ...args);
    });
  }
}

export const broadcaster = MainBroadcaster.instance;

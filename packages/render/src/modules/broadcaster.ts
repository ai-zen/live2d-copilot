import EventBus from "@ai-zen/event-bus";
import { rpc } from "./rpc";

export class RenderBroadcaster extends EventBus {
  static instance = new RenderBroadcaster();

  private constructor() {
    super();
    rpc.register("broadcaster", {
      emit: (event: string, ...args: any[]) => {
        this.emit(event, ...args);
      },
    });
  }

  broadcast(event: string, ...args: any[]) {
    rpc.use("broadcaster").broadcast(event, ...args);
  }
}

export const broadcaster = RenderBroadcaster.instance;

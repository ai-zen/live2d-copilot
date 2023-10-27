import { WebMessageRPC } from "web-message-rpc";
import "../electron-env.d.ts";

let handel: (_event: any, payload: any) => void;

export const rpc = new WebMessageRPC(
  {
    addEventListener: (callback) => {
      handel = (_event, payload) => {
        callback(payload);
      };
      window.electronAPI?.onRpcEvent(handel);
    },
    removeEventListener: (_callback) => {
      window.electronAPI?.offRpcEvent(handel);
    },
    postMessage: (payload) => {
      window.electronAPI?.emitRpcEvent(payload);
    },
  },
  {}
);

import { WebMessageRPC } from "web-message-rpc";
import "../electron-env.d.ts";

let handle: (_event: any, payload: any) => void;

export const rpc = new WebMessageRPC(
  {
    addEventListener: (callback) => {
      handle = (_event, payload) => {
        callback(payload);
      };
      window.electronAPI?.onRpcEvent(handle);
    },
    removeEventListener: (_callback) => {
      window.electronAPI?.offRpcEvent(handle);
    },
    postMessage: (payload) => {
      window.electronAPI?.emitRpcEvent(payload);
    },
  },
  {}
);

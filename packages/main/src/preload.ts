// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type { IpcRendererEvent } from "electron";
import { contextBridge, ipcRenderer } from "electron";

const api = {
  onRpcEvent: (callback: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on("rpc-event", callback),
  offRpcEvent: (_callback: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.removeAllListeners("rpc-event"),
  emitRpcEvent: (payload: any) => ipcRenderer.send("rpc-event", payload),
};

contextBridge.exposeInMainWorld("electronAPI", api);

export type ElectronAPI = typeof api;

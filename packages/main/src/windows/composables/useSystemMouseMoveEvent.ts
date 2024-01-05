import type { Point } from "electron";
import { screen } from "electron";
import { BrowserWindowEx } from "../../classes/BrowserWindowEx";

export function useSystemMouseMoveEvent(win: BrowserWindowEx) {
  let lastPoint: Point | null = null;
  const pointInterval = setInterval(() => {
    const point = screen.getCursorScreenPoint();
    const [x, y] = win.getPosition();
    const [w, h] = win.getSize();
    const winRect = { x, y, w, h };
    if (lastPoint && lastPoint.x == point.x && lastPoint.y == point.y) return;
    lastPoint = point;
    win.rpc.callProxy.onSystemMouseMoveEvent(point, winRect);
  }, 16);
  win.on("close", () => {
    clearInterval(pointInterval);
  });
}

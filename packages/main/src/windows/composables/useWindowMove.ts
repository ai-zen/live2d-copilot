import { screen } from "electron";
import { BrowserWindowEx } from "../../classes/BrowserWindowEx";

/**
 * Enable window movement
 */
export function useWindowMove(win: BrowserWindowEx) {
  let isMove = false;
  let pointInterval: any;

  function startWindowMove() {
    isMove = true;
    const beginPoint = screen.getCursorScreenPoint();
    const beginPosition = win.getPosition();
    const display = screen.getDisplayNearestPoint(beginPoint);
    const interval = 1000 / display.displayFrequency;

    clearInterval(pointInterval);

    pointInterval = setInterval(() => {
      if (!beginPosition || !beginPoint) return;
      const point = screen.getCursorScreenPoint();
      const [beginX, beginY] = beginPosition;
      const offsetX = point.x - beginPoint.x;
      const offsetY = point.y - beginPoint.y;
      win.setPosition(beginX + offsetX, beginY + offsetY, false);
    }, interval);
  }

  function endWindowMove() {
    isMove = false;
    clearInterval(pointInterval);
  }

  return {
    startWindowMove,
    endWindowMove,
  };
}

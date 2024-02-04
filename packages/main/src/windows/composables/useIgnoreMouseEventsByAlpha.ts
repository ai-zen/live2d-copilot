import { screen, BrowserWindow } from "electron";

export function useIgnoreMouseEventsByAlpha(win: BrowserWindow) {
  const updateIgnoreMouseEvents = async (x: number, y: number) => {
    if (!win.isVisible()) return;

    // capture 1x1 image of mouse position.
    const image = await win.webContents.capturePage({
      x,
      y,
      width: 1,
      height: 1,
    });

    var buffer = image.getBitmap();

    // set ignore mouse events by alpha.
    win.setIgnoreMouseEvents(!buffer[3]);
  };

  const pointInterval = setInterval(() => {
    const point = screen.getCursorScreenPoint();
    const [x, y] = win.getPosition();
    const [w, h] = win.getSize();
    if (point.x > x && point.x < x + w && point.y > y && point.y < y + h) {
      updateIgnoreMouseEvents(point.x - x, point.y - y);
    }
  }, 100);

  win.on("close", () => {
    clearInterval(pointInterval);
  });
}

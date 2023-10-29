export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

export async function waitFrames(count: number) {
  for (let index = 0; index < count; index++) {
    await nextFrame();
  }
}

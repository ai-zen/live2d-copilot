export function debounce<T extends Function>(cb: T, ms: number): T {
  let id = 0;
  return function (this: any) {
    clearTimeout(id);
    id = window.setTimeout(() => cb.apply(this, arguments), ms);
  } as unknown as T;
}

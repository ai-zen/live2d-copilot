export function toLocalURI(path: string) {
  return `app://file?path=${encodeURIComponent(path)}`;
}

export type PickRequired<T, K extends keyof T = any> = Partial<T> &
  Required<Pick<T, K>>;

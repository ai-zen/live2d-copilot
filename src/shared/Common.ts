// ============================================================
// Common Utility Types
// ============================================================

export type PickRequired<T, K extends keyof T = never> = Partial<T> & Required<Pick<T, K>>;

/** 带标签的已安装物品 */
export enum InstalledItemType {
  SystemItem = 0,
  WorkshopItem = 1,
}

export interface InstalledWorkshopItem<T = unknown> {
  type: InstalledItemType.WorkshopItem;
  workshopItem?: T;
}

export interface InstalledSystemItem<T = unknown> {
  type: InstalledItemType.SystemItem;
  systemItem?: T;
}

export type InstalledItem<T = unknown> = InstalledWorkshopItem<T> | InstalledSystemItem<T>;

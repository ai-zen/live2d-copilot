// ============================================================
// Steamworks / Workshop
// ============================================================

/** Workshop 物品类型标签 */
export enum ItemTypeTag {
  Models = "models",
  ChatTools = "chat_tools",
}

/** Workshop 物品状态 (bitflags) */
export enum ItemState {
  NONE = 0,
  SUBSCRIBED = 1 << 0,
  LEGACY_ITEM = 1 << 1,
  INSTALLED = 1 << 2,
  NEEDS_UPDATE = 1 << 3,
  DOWNLOADING = 1 << 4,
  DOWNLOAD_PENDING = 1 << 5,
}

/** 下载信息 */
export interface DownloadInfo {
  current: bigint;
  total: bigint;
}

/** 安装信息 */
export interface InstallInfo {
  folder: string;
  sizeOnDisk: bigint;
  timestamp: number;
}

/** 扩展的 Workshop 物品（含本地状态） */
export interface WorkshopItemExt {
  itemId: bigint;
  title: string;
  description: string;
  tags: string[];
  previewUrl?: string;
  itemState: ItemState;
  downloadInfo: DownloadInfo | null;
  installInfo: InstallInfo | null;
  timeCreated: number;
  timeUpdated: number;
}

/** UGC 发布表单 */
export interface UGCPublishForm {
  publishType: "add" | "update";
  itemId: string;
  title: string;
  description: string;
  visibility: number; // 0=Public, 1=FriendsOnly, 2=Private, 3=Unlisted
  contentPath: string;
  previewPath: string;
  changeNote: string;
  tags: string[];
}

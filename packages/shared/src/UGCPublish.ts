import { UgcItemVisibility } from "./Steamworks";

export enum UGCPublishType {
  Add = 0,
  Update = 1,
}

export interface UGCPublishForm {
  publishType: UGCPublishType;
  itemId: string;
  title: string;
  description: string;
  visibility: UgcItemVisibility;
  contentPath: string;
  previewPath: string;
  changeNote: string;
  tags: string[];
}

export type UGCPublishFormWithCustom<T> = UGCPublishForm & T;

export enum UgcItemVisibility {
  Public = 0,
  FriendsOnly,
  Private,
  Unlisted,
}

export enum UpdateStatus {
  Invalid = 0,
  PreparingConfig,
  PreparingContent,
  UploadingContent,
  UploadingPreviewFile,
  CommittingChanges,
}

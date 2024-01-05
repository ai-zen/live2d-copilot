export const enum UgcItemVisibility {
  Public = 0,
  FriendsOnly = 1,
  Private = 2,
  Unlisted = 3,
}

export enum UpdateStatus {
  Invalid = 0,
  PreparingConfig = 1,
  PreparingContent = 2,
  UploadingContent = 3,
  UploadingPreviewFile = 4,
  CommittingChanges = 5,
}

export enum UGCQueryType {
  RankedByVote = 0,
  RankedByPublicationDate = 1,
  AcceptedForGameRankedByAcceptanceDate = 2,
  RankedByTrend = 3,
  FavoritedByFriendsRankedByPublicationDate = 4,
  CreatedByFriendsRankedByPublicationDate = 5,
  RankedByNumTimesReported = 6,
  CreatedByFollowedUsersRankedByPublicationDate = 7,
  NotYetRated = 8,
  RankedByTotalVotesAsc = 9,
  RankedByVotesUp = 10,
  RankedByTextSearch = 11,
  RankedByTotalUniqueSubscriptions = 12,
  RankedByPlaytimeTrend = 13,
  RankedByTotalPlaytime = 14,
  RankedByAveragePlaytimeTrend = 15,
  RankedByLifetimeAveragePlaytime = 16,
  RankedByPlaytimeSessionsTrend = 17,
  RankedByLifetimePlaytimeSessions = 18,
  RankedByLastUpdatedDate = 19,
}

export enum UGCType {
  Items = 0,
  ItemsMtx = 1,
  ItemsReadyToUse = 2,
  Collections = 3,
  Artwork = 4,
  Videos = 5,
  Screenshots = 6,
  AllGuides = 7,
  WebGuides = 8,
  IntegratedGuides = 9,
  UsableInGame = 10,
  ControllerBindings = 11,
  GameManagedItems = 12,
  All = 13,
}

export enum UserListType {
  Published = 0,
  VotedOn = 1,
  VotedUp = 2,
  VotedDown = 3,
  Favorited = 4,
  Subscribed = 5,
  UsedOrPlayed = 6,
  Followed = 7,
}

export enum UserListOrder {
  CreationOrderAsc = 0,
  CreationOrderDesc = 1,
  TitleAsc = 2,
  LastUpdatedDesc = 3,
  SubscriptionDateDesc = 4,
  VoteScoreDesc = 5,
  ForModeration = 6,
}

export interface UpdateProgress {
  status: UpdateStatus;
  progress: bigint;
  total: bigint;
}

export interface WorkshopItemQueryConfig {
  cachedResponseMaxAge?: number;
  includeMetadata?: boolean;
  includeLongDescription?: boolean;
  includeAdditionalPreviews?: boolean;
  onlyIds?: boolean;
  onlyTotal?: boolean;
  language?: string;
  matchAnyTag?: boolean;
  requiredTags?: Array<string>;
  excludedTags?: Array<string>;
  searchText?: string;
}

export interface UgcUpdate {
  title?: string;
  description?: string;
  changeNote?: string;
  previewPath?: string;
  contentPath?: string;
  tags?: Array<string>;
  visibility?: UgcItemVisibility;
}

export interface PlayerSteamId {
  steamId64: bigint;
  steamId32: string;
  accountId: number;
}

export interface WorkshopItemAdditionalInformation {
  previewUrl?: string;
  numSubscriptions?: bigint;
  numFavorites?: bigint;
  numFollowers?: bigint;
  numUniqueSubscriptions?: bigint;
  numUniqueFavorites?: bigint;
  numUniqueFollowers?: bigint;
  numUniqueWebsiteViews?: bigint;
  reportScore?: bigint;
  numSecondsPlayed?: bigint;
  numPlaytimeSessions?: bigint;
  numComments?: bigint;
  numSecondsPlayedDuringTimePeriod?: bigint;
  numPlaytimeSessionsDuringTimePeriod?: bigint;
}

export interface WorkshopItem {
  publishedFileId: bigint;
  creatorAppId?: number;
  consumerAppId?: number;
  title: string;
  description: string;
  owner: PlayerSteamId;
  /** Time created in unix epoch seconds format */
  timeCreated: number;
  /** Time updated in unix epoch seconds format */
  timeUpdated: number;
  banned: boolean;
  acceptedForUse: boolean;
  tags: Array<string>;
  tagsTruncated: boolean;
  url: string;
  numUpvotes: number;
  numDownvotes: number;
  numChildren: number;
  additional?: WorkshopItemAdditionalInformation;
}

export interface WorkshopPageResult {
  items: Array<WorkshopItem | undefined | null>;
  returnedResults: number;
  totalResults: number;
  wasCached: boolean;
}

export interface InstallInfo {
  folder: string;
  sizeOnDisk: bigint;
  timestamp: number;
}

export interface DownloadInfo {
  current: bigint;
  total: bigint;
}

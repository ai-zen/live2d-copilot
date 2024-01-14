import { UGCQueryType } from "live2d-copilot-shader/src/Steamworks";
import { computed } from "vue";
import { useI18n } from "../../../modules/i18n";

export function useSortOptions() {
  const { t } = useI18n();

  const sortOptions = computed(() => [
    {
      label: t("ugc_query_type.ranked_by_vote"),
      value: `${UGCQueryType.RankedByVote}`,
      queryType: UGCQueryType.RankedByVote,
    },
    {
      label: t("ugc_query_type.ranked_by_publication_date"),
      value: `${UGCQueryType.RankedByPublicationDate}`,
      queryType: UGCQueryType.RankedByPublicationDate,
    },
    // {
    //   label: t("ugc_query_type.accepted_for_game_ranked_by_acceptance_date"),
    //   value: `${UGCQueryType.AcceptedForGameRankedByAcceptanceDate}`,
    //   queryType: UGCQueryType.AcceptedForGameRankedByAcceptanceDate,
    // },
    {
      label: t("ugc_query_type.ranked_by_trend_7"),
      value: `${UGCQueryType.RankedByTrend}_7`,
      queryType: UGCQueryType.RankedByTrend,
      day: 7,
    },
    {
      label: t("ugc_query_type.ranked_by_trend_30"),
      value: `${UGCQueryType.RankedByTrend}_30`,
      queryType: UGCQueryType.RankedByTrend,
      day: 30,
    },
    {
      label: t("ugc_query_type.ranked_by_trend_365"),
      value: `${UGCQueryType.RankedByTrend}_365`,
      queryType: UGCQueryType.RankedByTrend,
      day: 365,
    },
    // {
    //   label: t(
    //     "ugc_query_type.favorited_by_friends_ranked_by_publication_date"
    //   ),
    //   value: `${UGCQueryType.FavoritedByFriendsRankedByPublicationDate}`,
    //   queryType: UGCQueryType.FavoritedByFriendsRankedByPublicationDate,
    // },
    // {
    //   label: t("ugc_query_type.created_by_friends_ranked_by_publication_date"),
    //   value: `${UGCQueryType.CreatedByFriendsRankedByPublicationDate}`,
    //   queryType: UGCQueryType.CreatedByFriendsRankedByPublicationDate,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_num_times_reported"),
    //   value: `${UGCQueryType.RankedByNumTimesReported}`,
    //   queryType: UGCQueryType.RankedByNumTimesReported,
    // },
    // {
    //   label: t(
    //     "ugc_query_type.created_by_followed_users_ranked_by_publication_date"
    //   ),
    //   value: `${UGCQueryType.CreatedByFollowedUsersRankedByPublicationDate}`,
    //   queryType: UGCQueryType.CreatedByFollowedUsersRankedByPublicationDate,
    // },
    // {
    //   label: t("ugc_query_type.not_yet_rated"),
    //   value: `${UGCQueryType.NotYetRated}`,
    //   queryType: UGCQueryType.NotYetRated,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_total_votes_asc"),
    //   value: `${UGCQueryType.RankedByTotalVotesAsc}`,
    //   queryType: UGCQueryType.RankedByTotalVotesAsc,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_votes_up"),
    //   value: `${UGCQueryType.RankedByVotesUp}`,
    //   queryType: UGCQueryType.RankedByVotesUp,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_text_search"),
    //   value: `${UGCQueryType.RankedByTextSearch}`,
    //   queryType: UGCQueryType.RankedByTextSearch,
    // },
    {
      label: t("ugc_query_type.ranked_by_total_unique_subscriptions"),
      value: `${UGCQueryType.RankedByTotalUniqueSubscriptions}`,
      queryType: UGCQueryType.RankedByTotalUniqueSubscriptions,
    },
    // {
    //   label: t("ugc_query_type.ranked_by_playtime_trend"),
    //   value: `${UGCQueryType.RankedByPlaytimeTrend}`,
    //   queryType: UGCQueryType.RankedByPlaytimeTrend,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_total_playtime"),
    //   value: `${UGCQueryType.RankedByTotalPlaytime}`,
    //   queryType: UGCQueryType.RankedByTotalPlaytime,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_average_playtime_trend"),
    //   value: `${UGCQueryType.RankedByAveragePlaytimeTrend}`,
    //   queryType: UGCQueryType.RankedByAveragePlaytimeTrend,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_lifetime_average_playtime"),
    //   value: `${UGCQueryType.RankedByLifetimeAveragePlaytime}`,
    //   queryType: UGCQueryType.RankedByLifetimeAveragePlaytime,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_playtime_sessions_trend"),
    //   value: `${UGCQueryType.RankedByPlaytimeSessionsTrend}`,
    //   queryType: UGCQueryType.RankedByPlaytimeSessionsTrend,
    // },
    // {
    //   label: t("ugc_query_type.ranked_by_lifetime_playtime_sessions"),
    //   value: `${UGCQueryType.RankedByLifetimePlaytimeSessions}`,
    //   queryType: UGCQueryType.RankedByLifetimePlaytimeSessions,
    // },
    {
      label: t("ugc_query_type.ranked_by_last_updated_date"),
      value: `${UGCQueryType.RankedByLastUpdatedDate}`,
      queryType: UGCQueryType.RankedByLastUpdatedDate,
    },
  ]);

  return {
    sortOptions,
  };
}

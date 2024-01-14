import { computed } from "vue";
import { useI18n } from "../../../modules/i18n";

export function useTagsOptions(categories: string[]) {
  const { t } = useI18n();

  const tagsOptions = computed(() => {
    return [
      {
        label: t("tags_categories.age_rating"),
        value: "Age Rating",
        children: [
          {
            label: t("tags.everyone"),
            value: "Everyone",
          },
          {
            label: t("tags.questionable"),
            value: "Questionable",
          },
          {
            label: t("tags.mature"),
            value: "Mature",
          },
        ],
      },
      {
        label: t("tags_categories.models"),
        value: "Models",
        children: [
          {
            label: t("tags.game_character"),
            value: "Game Character",
          },
          {
            label: t("tags.anime_character"),
            value: "Anime Character",
          },
          {
            label: t("tags.v_tuber"),
            value: "Vtuber",
          },
          {
            label: t("tags.other"),
            value: "Other",
          },
        ],
      },
      {
        label: t("tags_categories.plugins"),
        value: "Plugins",
        children: [
          {
            label: t("tags.chat_plugin"),
            value: "Chat Plugin",
          },
          {
            label: t("tags.tool"),
            value: "Tool",
          },
        ],
      },
    ].filter((item) => categories.includes(item.value));
  });

  return {
    tagsOptions,
  };
}

import { computed } from "vue";
import { useI18n } from "../../../modules/i18n";

export enum TagsCategories {
  AgeRating = "Age Rating",
  Models = "Models",
  Plugins = "Plugins",
}

export enum AgeRatingTags {
  Everyone = "Everyone",
  Questionable = "Questionable",
  Mature = "Mature",
}

export enum ModelsTags {
  GameCharacter = "Game Character",
  AnimeCharacter = "Anime Character",
  VTuber = "VTuber",
  Other = "Other",
}

export enum PluginsTags {
  ChatPlugin = "ChatPlugin",
  Tool = "Tool",
}

export function useTagsOptions(categories: string[]) {
  const { t } = useI18n();

  const tagsOptions = computed(() => {
    return [
      {
        label: t("tags_categories.age_rating"),
        value: TagsCategories.AgeRating,
        children: [
          {
            label: t("tags.everyone"),
            value: AgeRatingTags.Everyone,
          },
          {
            label: t("tags.questionable"),
            value: AgeRatingTags.Questionable,
          },
          {
            label: t("tags.mature"),
            value: AgeRatingTags.Mature,
          },
        ],
      },
      {
        label: t("tags_categories.models"),
        value: TagsCategories.Models,
        children: [
          {
            label: t("tags.game_character"),
            value: ModelsTags.GameCharacter,
          },
          {
            label: t("tags.anime_character"),
            value: ModelsTags.AnimeCharacter,
          },
          {
            label: t("tags.v_tuber"),
            value: ModelsTags.VTuber,
          },
          {
            label: t("tags.other"),
            value: ModelsTags.Other,
          },
        ],
      },
      {
        label: t("tags_categories.plugins"),
        value: TagsCategories.Plugins,
        children: [
          {
            label: t("tags.chat_plugin"),
            value: PluginsTags.ChatPlugin,
          },
          {
            label: t("tags.tool"),
            value: PluginsTags.Tool,
          },
        ],
      },
    ].filter((item) => categories.includes(item.value));
  });

  const tagsGroupRecord = computed(() => {
    return Object.fromEntries(
      tagsOptions.value.map((tagsGroup) => [tagsGroup.value, tagsGroup])
    );
  });

  const tagsFlattened = computed(() => {
    return tagsOptions.value.flatMap((group) =>
      group.children.map((option) => option.value)
    );
  });

  const nodesKeys = computed(() => {
    return tagsOptions.value.flatMap((group) => [
      group.value,
      ...group.children.map((tag) => tag.value),
    ]);
  });

  return {
    tagsOptions,
    tagsGroupRecord,
    tagsFlattened,
    nodesKeys,
  };
}

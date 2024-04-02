import { computed } from "vue";
import { useI18n } from "../modules/i18n";

export enum TagsCategories {
  ItemTypeTags = "item_type_tags",
  AgeRatingTags = "age_rating_tags",
  ModelsTags = "models_tags",
}

export enum ItemTypeTags {
  Models = "models",
  Plugins = "plugins",
  GuiTools = "gui_tools",
  ChatPresets = "chat_presets",
  ChatTools = "chat_tools",
}

export enum AgeRatingTags {
  Everyone = "everyone",
  Questionable = "questionable",
  Mature = "mature",
}

export enum ModelsTags {
  GameCharacter = "game_character",
  AnimeCharacter = "anime_character",
  VTuber = "v_tuber",
  Other = "other",
}

export function useTagsOptions(categories: string[]) {
  const { t } = useI18n();

  const tagsOptions = computed(() => {
    return [
      {
        label: t("tags_categories.age_rating_tags"),
        value: TagsCategories.AgeRatingTags,
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
        label: t("tags_categories.models_tags"),
        value: TagsCategories.ModelsTags,
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
        label: t("tags_categories.item_type_tags"),
        value: TagsCategories.ItemTypeTags,
        children: [
          {
            label: t("tags.models"),
            value: ItemTypeTags.Models,
          },
          {
            label: t("tags.plugins"),
            value: ItemTypeTags.Plugins,
          },
          {
            label: t("tags.gui_tools"),
            value: ItemTypeTags.GuiTools,
          },
          {
            label: t("tags.chat_presets"),
            value: ItemTypeTags.ChatPresets,
          },
          {
            label: t("tags.chat_tools"),
            value: ItemTypeTags.ChatTools,
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

export function getExcludedTagsByItemType(itemType: ItemTypeTags) {
  return [
    ItemTypeTags.Models,
    ItemTypeTags.Plugins,
    ItemTypeTags.GuiTools,
    ItemTypeTags.ChatPresets,
    ItemTypeTags.ChatTools,
  ].filter((tag) => tag != itemType);
}

import {
  AgeRatingTags,
  ItemTypeTags,
  ModelsTags,
  TagsCategories,
} from "live2d-copilot-shared/src/Steamworks";
import { computed } from "vue";
import { useI18n } from "../modules/i18n";

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
          // {
          //   label: t("tags.gui_tools"),
          //   value: ItemTypeTags.GuiTools,
          // },
          // {
          //   label: t("tags.chat_presets"),
          //   value: ItemTypeTags.ChatPresets,
          // },
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

export function getExcludedTagsByItemTypes(itemTypes: ItemTypeTags[]) {
  return [
    ItemTypeTags.Models,
    // ItemTypeTags.GuiTools,
    // ItemTypeTags.ChatPresets,
    ItemTypeTags.ChatTools,
  ].filter((tag) => !itemTypes.includes(tag));
}

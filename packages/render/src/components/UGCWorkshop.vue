<template>
  <div class="ugc-list-page">
    <div class="filter-column">
      <el-button
        class="reset-filter-button"
        type="primary"
        plain
        @click="onReset"
        >{{ t("reset_filter_setting") }}</el-button
      >
      <el-select
        class="sort-select"
        v-model="filterState.form.sort"
        @change="getNewList"
      >
        <el-option
          v-for="(option, index) of sortOptions"
          :key="index"
          :label="option.label"
          :value="option.value"
        ></el-option>
      </el-select>
      <el-input
        class="search-input"
        v-model="filterState.form.keyword"
        :prefix-icon="Search"
        :placeholder="t('keyword_search_placeholder')"
        @change="getNewList"
      ></el-input>
      <div class="tree-wrapper">
        <el-tree
          :data="tagsOptions"
          show-checkbox
          default-expand-all
          :default-checked-keys="nodesKeys"
          @check="onTreeNodeCheck"
          node-key="value"
          ref="filterTreeRef"
        />
      </div>
    </div>

    <div class="list-column" v-loading="listState.isLoading">
      <AutoGrid :list="listState.list">
        <template #default="{ item }: { item: WorkshopItem }">
          <WorkshopItemCard :item="item" @click="onCardClick(item)" />
        </template>
      </AutoGrid>

      <div class="list-column-bottom">
        <el-pagination
          v-model:current-page="paginationState.currentPage"
          v-model:page-size="paginationState.pageSize"
          :page-sizes="paginationState.pageSizes"
          layout="sizes, total, prev, pager, next"
          :total="paginationState.total"
          @current-change="onCurrentChange"
          @size-change="onSizeChange"
        />
      </div>
    </div>

    <WorkshopItemDetailColumn
      v-if="focusState.current"
      :item="focusState.current"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import type { Methods as SteamworksAPIMethods } from "live2d-copilot-main/src/windows/preloads/steamworks";
import {
  UGCQueryType,
  UGCType,
  WorkshopItem,
  WorkshopItemQueryConfig,
  WorkshopPaginatedResult,
} from "live2d-copilot-shared/src/Steamworks";
import { onMounted, reactive, ref } from "vue";
import AutoGrid from "../components/AutoGrid.vue";
import { rpc } from "../modules/rpc";
import WorkshopItemCard from "../components/WorkshopItemCard.vue";
import WorkshopItemDetailColumn from "../components/WorkshopItemDetailColumn.vue";
import { useSortOptions } from "../composables/useUGCSortOptions";
import {
  ItemTypeTags,
  TagsCategories,
  useTagsOptions,
  getExcludedTagsByItemType,
} from "../composables/useUGCTagsOptions";
import { workshop } from "../modules/workshop";
import { useI18n } from "../modules/i18n";
import { ElTree } from "element-plus";

const { t } = useI18n();

const steamworksApi = rpc.use<SteamworksAPIMethods>("steamworks");

const filterTreeRef = ref<null | InstanceType<typeof ElTree>>(null);

const { tagsOptions, tagsFlattened, nodesKeys } = useTagsOptions([
  TagsCategories.AgeRatingTags,
  TagsCategories.ModelsTags,
]);

const { sortOptions } = useSortOptions();

const DEFAULT_FILTER_FORM = {
  requiredTags: [...tagsFlattened.value] as string[],
  excludedTags: [] as string[],
  sort: `${UGCQueryType.RankedByVote}`,
  keyword: "",
};

const filterState = reactive({
  form: structuredClone(DEFAULT_FILTER_FORM),
});

const paginationState = reactive({
  currentPage: 1,
  total: 0,
  pageSize: 50,
  pageSizes: [50],
});

const listState = reactive({
  list: [] as WorkshopItem[],
  isLoading: false,
  isReady: false,
});

async function loadList() {
  console.log("loadList");
  try {
    listState.isLoading = true;
    const currentSortOption = sortOptions.value.find(
      (option) => option.value == filterState.form.sort
    );

    const res = (await steamworksApi.getAllItems(
      paginationState.currentPage,
      currentSortOption?.queryType ?? UGCQueryType.RankedByPublicationDate,
      UGCType.Items,
      JSON.parse(
        JSON.stringify(<WorkshopItemQueryConfig>{
          rankedByTrendDays: currentSortOption?.day,
          searchText: filterState.form.keyword || undefined,
          matchAnyTag: true,
          requiredTags: filterState.form.requiredTags,
          excludedTags: [
            ...getExcludedTagsByItemType(ItemTypeTags.Models),
            ...filterState.form.excludedTags,
          ],
        })
      )
    )) as unknown as WorkshopPaginatedResult;
    console.log("res", res);
    listState.list = res.items.filter((item) => item) as WorkshopItem[];
    paginationState.total = res.totalResults;
    listState.isReady = true;
  } catch (error) {
    console.error(error);
  } finally {
    listState.isLoading = false;
  }
}

async function getNewList() {
  paginationState.currentPage = 1;
  await loadList();
}

function onSizeChange() {
  getNewList();
}

function onCurrentChange() {
  loadList();
}

function onReset() {
  filterState.form = structuredClone(DEFAULT_FILTER_FORM);
  filterTreeRef.value?.setCheckedKeys(filterState.form.requiredTags);
  getNewList();
}

function onTreeNodeCheck() {
  const nodes = filterTreeRef.value?.getCheckedNodes(true);
  filterState.form.requiredTags = nodes?.map((node) => node.value) ?? [];
  filterState.form.excludedTags = tagsFlattened.value.filter(
    (tag) => !filterState.form.requiredTags.includes(tag)
  );
  getNewList();
}

const focusState = reactive({
  current: null as WorkshopItem | null,
});

async function onCardClick(item: WorkshopItem) {
  focusState.current = item;
}

onMounted(async () => {
  getNewList();
  await workshop.getSubscribedIds();
  await workshop.updateSubscribedItemsStatusData();
});
</script>

<style lang="scss" src="../styles/ugc-list-page.scss"></style>

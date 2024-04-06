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
        @change="loadNewList"
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
        @change="loadNewList"
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
      <AutoGrid :list="renderList">
        <template #default="{ item }: { item: InstalledItem }">
          <SystemItemCard
            v-if="item.type == InstalledItemType.SystemItem && item.systemItem"
            :item="item.systemItem"
            @click="onCardClick(item)"
          />
          <WorkshopItemCard
            v-if="
              item.type == InstalledItemType.WorkshopItem && item.workshopItem
            "
            :item="item.workshopItem"
            @click="onCardClick(item)"
          />
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

    <SystemItemDetailColumn
      v-if="focusState.current?.type === InstalledItemType.SystemItem"
      :item="focusState.current.systemItem!"
    />
    <WorkshopItemDetailColumn
      v-if="focusState.current?.type === InstalledItemType.WorkshopItem"
      :item="focusState.current.workshopItem!"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ElTree } from "element-plus";
import {
  InstalledItem,
  InstalledItemType,
  WorkshopExtendItem,
} from "live2d-copilot-shared/src/Steamworks";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import AutoGrid from "../components/AutoGrid.vue";
import SystemItemCard from "../components/SystemItemCard.vue";
import SystemItemDetailColumn from "../components/SystemItemDetailColumn.vue";
import WorkshopItemCard from "../components/WorkshopItemCard.vue";
import WorkshopItemDetailColumn from "../components/WorkshopItemDetailColumn.vue";
import {
  TagsCategories,
  useTagsOptions,
} from "../composables/useUGCTagsOptions";
import { broadcaster } from "../modules/broadcaster";
import { useI18n } from "../modules/i18n";
import { workshopManager } from "../modules/workshopManager";

const props = defineProps<{
  getSystemItems?: () => Promise<InstalledItem[]>;
  tagsCategories: TagsCategories[];
  requiredTags: string[];
  excludedTags: string[];
}>();

const emit = defineEmits<{
  (e: "ready"): void;
  (e: "focus-item", item: InstalledItem): void;
}>();

const { t } = useI18n();

const filterTreeRef = ref<null | InstanceType<typeof ElTree>>(null);

const { tagsOptions, tagsFlattened, nodesKeys } = useTagsOptions(
  props.tagsCategories
);

enum InstalledSortType {
  RankedByName,
  RankedBySubscriptionTime,
}

const sortOptions = computed(() => [
  {
    label: t("sort_type.ranked_by_name"),
    value: InstalledSortType.RankedByName,
    queryType: InstalledSortType.RankedByName,
  },
  {
    label: t("sort_type.ranked_by_subscription_time"),
    value: InstalledSortType.RankedBySubscriptionTime,
    queryType: InstalledSortType.RankedBySubscriptionTime,
  },
]);

const DEFAULT_FILTER_FORM = {
  requiredTags: [...tagsFlattened.value] as string[],
  excludedTags: [] as string[],
  sort: InstalledSortType.RankedByName,
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
  list: [] as InstalledItem[],
  isLoading: false,
  isReady: false,
});

const renderList = computed(() => {
  const { currentPage, pageSize } = paginationState;
  return listState.list.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
});

function listFilter(list: InstalledItem[]) {
  return list.filter((item) => {
    switch (item.type) {
      case InstalledItemType.SystemItem:
        return true;
      case InstalledItemType.WorkshopItem:
        return (
          [...filterState.form.requiredTags, ...props.requiredTags].some(
            (requiredTag) =>
              item.workshopItem?.tags.find(
                (tag) => tag.toLocaleLowerCase() == requiredTag.toLowerCase()
              )
          ) &&
          ![...filterState.form.excludedTags, ...props.excludedTags].some(
            (excludedTag) =>
              item.workshopItem?.tags.find(
                (tag) => tag.toLocaleLowerCase() == excludedTag.toLowerCase()
              )
          ) &&
          item.workshopItem?.title.includes(filterState.form.keyword)
        );
    }
  });
}

function listSort(list: InstalledItem[]) {
  const listCloned = list.slice();
  switch (filterState.form.sort) {
    case InstalledSortType.RankedByName:
      listCloned.sort((a, b) => {
        let aName =
          a.type == InstalledItemType.SystemItem
            ? a.systemItem!.title
            : a.workshopItem!.title;
        let bName =
          b.type == InstalledItemType.SystemItem
            ? b.systemItem!.title
            : b.workshopItem!.title;
        return aName.localeCompare(bName);
      });
      break;
    case InstalledSortType.RankedBySubscriptionTime:
      // TODO: Use accurate subscription time.
      listCloned.sort((a, b) => {
        let aTime =
          a.type == InstalledItemType.SystemItem
            ? 0
            : a.workshopItem?.installInfo?.timestamp || Infinity;
        let bTime =
          b.type == InstalledItemType.SystemItem
            ? 0
            : b.workshopItem?.installInfo?.timestamp || Infinity;
        return aTime - bTime;
      });
      break;
  }
  return listCloned;
}

async function loadList() {
  try {
    listState.isLoading = true;

    const systemItems = (await props.getSystemItems?.()) || [];

    // Get workshop subscribed items.
    const items = await workshopManager.syncSubscribedItems();
    const workshopItems = items.map(
      (item): InstalledItem => ({
        type: InstalledItemType.WorkshopItem,
        workshopItem: item,
      })
    );

    let list = [...systemItems, ...workshopItems];
    list = listFilter(list);
    list = listSort(list);
    listState.list = list;
    console.log("listState.list", listState.list);

    paginationState.total = listState.list.length;
    listState.isReady = true;
  } catch (error) {
  } finally {
    listState.isLoading = false;
  }
}

async function loadNewList() {
  paginationState.currentPage = 1;
  await loadList();
}

function onSizeChange() {
  loadNewList();
}

function onCurrentChange() {
  loadList();
}

function onReset() {
  filterState.form = structuredClone(DEFAULT_FILTER_FORM);
  filterTreeRef.value?.setCheckedKeys(filterState.form.requiredTags);
  loadNewList();
}

function onTreeNodeCheck() {
  const nodes = filterTreeRef.value?.getCheckedNodes(true);
  filterState.form.requiredTags = nodes?.map((node) => node.value) ?? [];
  filterState.form.excludedTags = tagsFlattened.value.filter(
    (tag) => !filterState.form.requiredTags.includes(tag)
  );
  loadNewList();
}

const focusState = reactive({
  current: null as InstalledItem | null,
});

function onCardClick(item: InstalledItem) {
  focusItem(item);
}

async function focusItem(item: InstalledItem) {
  focusState.current = item;
  emit("focus-item", item);
}

async function onItemSubscribed(_itemId: bigint, item: WorkshopExtendItem) {
  listState.list.push({
    type: InstalledItemType.WorkshopItem,
    workshopItem: item,
  });
}

function onItemUnsubscribed(itemId: bigint) {
  const index = listState.list.findIndex(
    (item) =>
      item.type == InstalledItemType.WorkshopItem &&
      item.workshopItem?.publishedFileId == itemId
  );
  if (index != -1) {
    listState.list.splice(index, 1);
  }
}

onMounted(async () => {
  broadcaster.on("subscribed", onItemSubscribed);
  broadcaster.on("unsubscribed", onItemUnsubscribed);

  await loadNewList();

  emit("ready");
});

onUnmounted(() => {
  broadcaster.off("subscribed", onItemSubscribed);
  broadcaster.off("unsubscribed", onItemUnsubscribed);
});

defineExpose({
  focusItem,
  listState,
  focusState,
});
</script>

<style lang="scss" src="../styles/ugc-list-page.scss"></style>

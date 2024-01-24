<template>
  <div class="modules-list">
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
      <AutoGrid :list="renderList">
        <template #default="{ item }: { item: InstalledItem }">
          <SystemItemCard
            v-if="item.systemItem"
            :item="item.systemItem"
            @click="onCardClick(item)"
          />
          <WorkshopItemCard
            v-if="item.workshopItem"
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
      v-if="focusState.currentSystemItem"
      :item="focusState.currentSystemItem"
    />
    <WorkshopItemDetailColumn
      v-if="focusState.currentWorkshopItem"
      :item="focusState.currentWorkshopItem"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { ElTree } from "element-plus";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import type { Live2DModelProfileEx } from "live2d-copilot-shared/src/Live2DModels";
import type {
  WorkshopItem,
  WorkshopItemsResult,
} from "live2d-copilot-shared/src/Steamworks";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import AutoGrid from "../../components/AutoGrid.vue";
import { useI18n } from "../../modules/i18n";
import { rpc } from "../../modules/rpc";
import SystemItemCard from "./components/SystemItemCard.vue";
import SystemItemDetailColumn from "./components/SystemItemDetailColumn.vue";
import WorkshopItemCard from "./components/WorkshopItemCard.vue";
import WorkshopItemDetailColumn from "./components/WorkshopItemDetailColumn.vue";
import {
  ItemTypeTags,
  TagsCategories,
  useTagsOptions,
} from "./composables/useTagsOptions";
import { workshopItemsManager } from "./modules/workshopItemsManager";

const { t } = useI18n();

enum InstalledItemType {
  SystemItem = 0,
  WorkshopItem,
}

interface InstalledItem {
  type: InstalledItemType;
  workshopItem?: WorkshopItem;
  systemItem?: Live2DModelProfileEx;
}

const winApi = rpc.use<Methods>("models-window");
const filterTreeRef = ref<null | InstanceType<typeof ElTree>>(null);

const { tagsOptions, tagsFlattened, nodesKeys } = useTagsOptions([
  TagsCategories.AgeRatingTags,
  TagsCategories.ModelsTags,
]);

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
          item.workshopItem?.tags.includes(ItemTypeTags.Models) &&
          filterState.form.requiredTags.some((requiredTag) =>
            item.workshopItem?.tags.find(
              (tag) => tag.toLocaleLowerCase() == requiredTag.toLowerCase()
            )
          ) &&
          !filterState.form.excludedTags.some((excludedTag) =>
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
            ? a.systemItem!.Title
            : a.workshopItem!.title;
        let bName =
          b.type == InstalledItemType.SystemItem
            ? b.systemItem!.Title
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
            : workshopItemsManager.getCachedItemStatusData(
                a.workshopItem!.publishedFileId
              )?.installInfo?.timestamp || Infinity;
        let bTime =
          b.type == InstalledItemType.SystemItem
            ? 0
            : workshopItemsManager.getCachedItemStatusData(
                b.workshopItem!.publishedFileId
              )?.installInfo?.timestamp || Infinity;
        return aTime - bTime;
      });
      break;
  }
  return listCloned;
}

async function getList() {
  try {
    listState.isLoading = true;

    // Get system items.
    const profiles = await winApi.loadProfiles();
    const systemItems = profiles.map(
      (item): InstalledItem => ({
        type: InstalledItemType.SystemItem,
        systemItem: item,
      })
    );

    // Get workshop subscribed items.
    const ids = await workshopItemsManager.getSubscribedIds();
    const res = ids?.length
      ? // There is a known issue that when passing an empty array (ids), the function will never return.
        ((await winApi.getItems(ids)) as unknown as WorkshopItemsResult)
      : null;
    await workshopItemsManager.updateSubscribedItemsStatusData();
    const items = res?.items ?? [];
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

async function getNewList() {
  paginationState.currentPage = 1;
  await getList();
}

function onSizeChange() {
  getNewList();
}

function onCurrentChange() {
  getList();
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
  currentItemType: null as InstalledItemType | null,
  currentWorkshopItem: null as WorkshopItem | null,
  currentSystemItem: null as Live2DModelProfileEx | null,
});

function onCardClick(item: InstalledItem) {
  useItem(item);
}

async function useItem(item: InstalledItem) {
  if (item.type == InstalledItemType.SystemItem) {
    focusState.currentWorkshopItem = null;
    focusState.currentSystemItem = item.systemItem!;
    await winApi.setCurrent(item.systemItem!._ModelPath);
  } else {
    focusState.currentWorkshopItem = item.workshopItem!;
    focusState.currentSystemItem = null;
    const statusData = await workshopItemsManager.updateItemStatusData(
      item.workshopItem!.publishedFileId
    );
    if (statusData?.installInfo?.folder) {
      const profile = await winApi.loadProfile(statusData.installInfo.folder);
      if (profile) {
        await winApi.setCurrent(profile._ModelPath);
      }
    }
  }
  focusState.currentItemType = item.type;
}

const usedState = reactive({
  currentProfile: null as Live2DModelProfileEx | null,
  isLoading: false,
  isReady: false,
});

async function getCurrentUsedProfile() {
  try {
    usedState.isLoading = true;
    usedState.currentProfile = await winApi.getCurrentProfile();
    usedState.isReady = true;
  } catch (error) {
  } finally {
    usedState.isLoading = false;
  }
}

function focusCurrentUsedItem() {
  listState.list.forEach((item) => {
    if (item.type == InstalledItemType.SystemItem) {
      if (item.systemItem?._ModelDir == usedState.currentProfile?._ModelDir) {
        focusState.currentItemType = InstalledItemType.SystemItem;
        focusState.currentSystemItem = item.systemItem!;
      }
    } else {
      const statusData = workshopItemsManager.getCachedItemStatusData(
        item.workshopItem!.publishedFileId
      );
      if (
        statusData?.installInfo?.folder == usedState.currentProfile?._ModelDir
      ) {
        focusState.currentItemType = InstalledItemType.WorkshopItem;
        focusState.currentWorkshopItem = item.workshopItem!;
      }
    }
  });
}

async function onItemSubscribed(itemId: bigint) {
  const item = await winApi.getItem(itemId);
  if (item) {
    await workshopItemsManager.updateItemStatusData(itemId);
    listState.list.push({
      type: InstalledItemType.WorkshopItem,
      workshopItem: item as unknown as WorkshopItem,
    });

    // May need to be sorted.
    // listSort(listState.list, filterState.form.sort);
  }
}

function onItemUnsubscribed(itemId: bigint) {
  const index = listState.list.findIndex(
    (item) => item.workshopItem?.publishedFileId == itemId
  );
  if (index != -1) {
    listState.list.splice(index, 1);
  }

  // If the unsubscribed item is currently in use, switch the currently in use item to the first item in the list.
  const statusData = workshopItemsManager.getCachedItemStatusData(itemId);
  if (
    statusData?.installInfo?.folder == usedState.currentProfile?._ModelDir &&
    listState.list[0]
  ) {
    useItem(listState.list[0]);
  }
}

onMounted(async () => {
  workshopItemsManager.eventBus.on("subscribed", onItemSubscribed);
  workshopItemsManager.eventBus.on("unsubscribed", onItemUnsubscribed);

  await getNewList();
  await getCurrentUsedProfile();

  focusCurrentUsedItem();
});

onUnmounted(() => {
  workshopItemsManager.eventBus.off("subscribed", onItemSubscribed);
  workshopItemsManager.eventBus.off("unsubscribed", onItemUnsubscribed);
});
</script>

<style lang="scss" src="./styles/models-list.scss"></style>

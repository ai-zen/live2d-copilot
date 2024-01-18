<template>
  <div class="modules-list">
    <div class="filter-column">
      <el-input
        :prefix-icon="Search"
        :placeholder="t('keyword_search_placeholder')"
      ></el-input>
      <div class="tree-wrapper">
        <el-tree :data="filterState.tree" show-checkbox />
      </div>
    </div>
    <div class="list-column">
      <AutoGrid :list="renderList">
        <template #default="{ item }: { item: MyItem }">
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
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        />
        <el-select class="sort-select" v-model="sortState.current">
          <el-option
            v-for="(option, index) of sortState.options"
            :key="index"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
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
import type { Live2DModelProfileEx } from "live2d-copilot-main/src/modules/live2DModelsManager";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import { WorkshopItem } from "live2d-copilot-shared/src/Steamworks";
import { computed, onMounted, onUnmounted, reactive } from "vue";
import AutoGrid from "../../components/AutoGrid.vue";
import { rpc } from "../../modules/rpc";
import SystemItemCard from "./components/SystemItemCard.vue";
import SystemItemDetailColumn from "./components/SystemItemDetailColumn.vue";
import WorkshopItemCard from "./components/WorkshopItemCard.vue";
import WorkshopItemDetailColumn from "./components/WorkshopItemDetailColumn.vue";
import { workshopItemsManager } from "./modules/workshopItemsManager";
import { useI18n } from "../../modules/i18n";

const { t } = useI18n();

enum MyItemType {
  SystemItem = 0,
  WorkshopItem,
}

interface MyItem {
  type: MyItemType;
  workshopItem?: WorkshopItem;
  systemItem?: Live2DModelProfileEx;
}

const winApi = rpc.use<Methods>("models-window");

const filterState = reactive({
  tree: [
    {
      label: "年龄分级",
      children: [
        {
          label: "全年龄",
        },
        {
          label: "家长指导级",
        },
        {
          label: "成人",
        },
      ],
    },
    {
      label: "类型",
      children: [
        {
          label: "动漫",
        },
        {
          label: "游戏",
        },
        {
          label: "虚拟主播",
        },
        {
          label: "其他",
        },
      ],
    },
  ],
});

const sortState = reactive({
  current: "title",
  options: [
    { label: "按名称排序", value: "title" },
    { label: "按订阅日期排序", value: "subscription-time" },
  ],
});

const paginationState = reactive({
  currentPage: 1,
  total: 0,
  pageSize: 50,
  pageSizes: [50],
});

const listState = reactive({
  list: [] as MyItem[],
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

async function getList() {
  try {
    listState.isLoading = true;
    const profiles = await winApi.loadProfiles();
    const subscribedIds = await workshopItemsManager.getSubscribedIds();
    // TODO: There is a known issue that when passing an empty array (subscribedIds), the function will never return.
    const itemsRes = subscribedIds?.length
      ? await winApi.getItems(subscribedIds)
      : null;
    await workshopItemsManager.updateSubscribedItemsStatusData();
    console.log("itemsRes", itemsRes);
    const subscribedItems = itemsRes?.items ?? [];
    listState.list = [
      ...profiles.map(
        (profile): MyItem => ({
          type: MyItemType.SystemItem,
          systemItem: profile,
        })
      ),
      ...subscribedItems.map(
        (item): MyItem => ({
          type: MyItemType.WorkshopItem,
          workshopItem: item!,
        })
      ),
    ];
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

function onSizeChange() {}

function onCurrentChange() {}

const focusState = reactive({
  currentItemType: null as MyItemType | null,
  currentWorkshopItem: null as WorkshopItem | null,
  currentSystemItem: null as Live2DModelProfileEx | null,
});

function onCardClick(item: MyItem) {
  useItem(item);
}

async function useItem(item: MyItem) {
  if (item.type == MyItemType.SystemItem) {
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
    if (item.type == MyItemType.SystemItem) {
      if (item.systemItem?._ModelDir == usedState.currentProfile?._ModelDir) {
        focusState.currentItemType = MyItemType.SystemItem;
        focusState.currentSystemItem = item.systemItem!;
      }
    } else {
      const statusData = workshopItemsManager.getCachedItemStatusData(
        item.workshopItem!.publishedFileId
      );
      if (
        statusData?.installInfo?.folder == usedState.currentProfile?._ModelDir
      ) {
        focusState.currentItemType = MyItemType.WorkshopItem;
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
      type: MyItemType.WorkshopItem,
      workshopItem: item,
    });
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

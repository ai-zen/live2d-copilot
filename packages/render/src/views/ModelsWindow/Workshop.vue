<template>
  <div class="modules-list">
    <div class="filter-column">
      <el-input :prefix-icon="Search" placeholder="请输入关键字搜索"></el-input>
      <div class="tree-wrapper">
        <el-tree :data="filterState.tree" show-checkbox />
      </div>
    </div>
    <div class="list-column">
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
    <WorkshopItemDetailColumn
      v-if="focusState.current"
      :item="focusState.current"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import {
  UGCQueryType,
  UGCType,
  WorkshopItem,
  WorkshopPageResult,
} from "live2d-copilot-shader/src/Steamworks";
import { onMounted, reactive } from "vue";
import AutoGrid from "../../components/AutoGrid.vue";
import { rpc } from "../../modules/rpc";
import WorkshopItemCard from "./components/WorkshopItemCard.vue";
import WorkshopItemDetailColumn from "./components/WorkshopItemDetailColumn.vue";
import { workshopItemsManager } from "./modules/workshopItemsManager";

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
  list: [] as WorkshopItem[],
  isLoading: false,
  isReady: false,
});

async function getList() {
  try {
    listState.isLoading = true;
    const res = (await winApi.getAllItems(
      paginationState.currentPage,
      UGCQueryType.RankedByPublicationDate,
      UGCType.Items
    )) as WorkshopPageResult;
    listState.list = res.items as WorkshopItem[];
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
  await getList();
}

const focusState = reactive({
  current: null as WorkshopItem | null,
});

async function onCardClick(item: WorkshopItem) {
  focusState.current = item;
}

onMounted(async () => {
  getNewList();
  await workshopItemsManager.getSubscribedIds();
  await workshopItemsManager.updateSubscribedItemsStatusData();
});
</script>

<style lang="scss" src="./styles/models-list.scss"></style>

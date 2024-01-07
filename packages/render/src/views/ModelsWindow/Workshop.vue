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
          <div
            class="card"
            :class="{
              'is-current': false,
            }"
            @click="onCardClick(item)"
          >
            <img class="image" :src="item.additional?.previewUrl" />
            <div class="content">
              <div class="title">{{ item.title }}</div>
            </div>
            <div
              v-if="workshopItemsManager.isDownloading(item.publishedFileId)"
              class="download-info"
            >
              <el-progress
                type="circle"
                :percentage="formatDownloadProgress(item)"
              />
            </div>
            <div
              class="status-info"
              v-if="
                workshopItemsManager.getCachedItemStatusData(
                  item.publishedFileId
                )?.itemState
              "
            >
              {{ formatItemStateText(item) }}
            </div>
          </div>
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
    <div class="detail-column" v-if="currentState.current">
      <div class="detail-scroll-wrapper">
        <div class="detail-scroll-content">
          <img
            class="image"
            :src="currentState.current.additional?.previewUrl"
          />
          <div class="content">
            <div class="count-row">
              <el-rate :modelValue="getRate(currentState.current)" disabled />
              <div class="count-subscription">
                {{ currentState.current.additional?.numSubscriptions }}订阅
              </div>
              <div class="count-collection">
                {{ currentState.current.additional?.numFavorites }}收藏
              </div>
            </div>
            <div class="button-row">
              <el-button
                v-if="
                  workshopItemsManager.isSubscribed(
                    currentState.current.publishedFileId
                  )
                "
                class="subscription-button"
                size="large"
                type="danger"
                :loading="
                  workshopItemsManager.isUnsubscribing(
                    currentState.current.publishedFileId
                  )
                "
                @click="
                  workshopItemsManager.unsubscribe(
                    currentState.current.publishedFileId
                  )
                "
                >取消订阅</el-button
              >
              <el-button
                v-else
                class="subscription-button"
                size="large"
                type="primary"
                :loading="
                  workshopItemsManager.isSubscribing(
                    currentState.current.publishedFileId
                  )
                "
                @click="
                  workshopItemsManager.subscribe(
                    currentState.current.publishedFileId
                  )
                "
                >订阅</el-button
              >
            </div>
            <div class="title">{{ currentState.current.title }}</div>
            <div class="desc">{{ currentState.current.description }}</div>
          </div>
        </div>
      </div>
    </div>
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
  ItemState,
} from "live2d-copilot-shader/src/Steamworks";
import { onMounted, reactive } from "vue";
import AutoGrid from "../../components/AutoGrid.vue";
import { rpc } from "../../modules/rpc";
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

const currentState = reactive({
  current: null as WorkshopItem | null,
});

async function onCardClick(item: WorkshopItem) {
  currentState.current = item;
}

function getRate(item: WorkshopItem) {
  const { numUpvotes, numDownvotes } = item;
  if (!(numUpvotes + numDownvotes)) return -1;
  return (numUpvotes / (numUpvotes + numDownvotes)) * 5;
}

function formatDownloadProgress(item: WorkshopItem) {
  const statusData = workshopItemsManager.getCachedItemStatusData(
    item.publishedFileId
  );
  if (!statusData?.downloadInfo) return 0;
  return Math.round(
    (Number(statusData.downloadInfo.current) /
      (Number(statusData.downloadInfo.total) || 1)) *
      100
  );
}

function formatItemStateText(item: WorkshopItem) {
  const statusData = workshopItemsManager.getCachedItemStatusData(
    item.publishedFileId
  );
  if (!statusData?.itemState) return "";
  const stateTextList: [ItemState, string][] = [
    [ItemState.NONE, "无状态"],
    [ItemState.SUBSCRIBED, "已订阅"],
    [ItemState.LEGACY_ITEM, "遗留项目"],
    [ItemState.INSTALLED, "已安装"],
    [ItemState.NEEDS_UPDATE, "需要更新"],
    [ItemState.DOWNLOADING, "下载中"],
    [ItemState.DOWNLOAD_PENDING, "下载排队中"],
  ];
  return stateTextList
    .filter(([bit]) => bit & statusData.itemState)
    .map(([_bit, text]) => text)
    .join("+");
}

onMounted(() => {
  getNewList();
  workshopItemsManager.getSubscribedItems();
});
</script>

<style lang="scss" src="./styles/models-list.scss"></style>

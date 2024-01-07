<template>
  <div class="modules-list">
    <div class="filter-column">
      <el-input :prefix-icon="Search" placeholder="请输入关键字搜索"></el-input>
      <div class="tree-wrapper">
        <el-tree :data="filterState.tree" show-checkbox />
      </div>
    </div>
    <div class="list-column">
      <AutoGrid :list="renderList">
        <template #default="{ item }: { item: Live2DModelProfileEx }">
          <div
            class="card"
            :class="{
              'is-current': item._ModelPath == currentState.current?._ModelPath,
            }"
            @click="onCardClick(item)"
          >
            <img
              class="image"
              :src="toLocalURI(item._ModelDir + '/' + item.Preview)"
            />
            <div class="content">
              <div class="title">{{ item.Title }}</div>
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
    <div class="detail-column" v-if="currentState.current">
      <div class="detail-scroll-wrapper">
        <div class="detail-scroll-content">
          <img
            class="image"
            :src="
              toLocalURI(
                currentState.current._ModelDir +
                  '/' +
                  currentState.current.Preview
              )
            "
          />
          <div class="content">
            <div class="count-row">
              <el-rate :modelValue="3" disabled />
              <div class="count-subscription">0.0K订阅</div>
              <div class="count-collection">0.0K收藏</div>
            </div>
            <div class="button-row">
              <el-button class="subscription-button" size="large" type="primary"
                >取消订阅</el-button
              >
            </div>
            <div class="title">{{ currentState.current.Title }}</div>
            <div class="desc">{{ currentState.current.Description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import type { Live2DModelProfileEx } from "live2d-copilot-main/src/modules/live2DModelsManager";
import type { Methods } from "live2d-copilot-main/src/windows/createModelsWindow";
import { computed, onMounted, reactive } from "vue";
import AutoGrid from "../../components/AutoGrid.vue";
import { rpc } from "../../modules/rpc";
import { toLocalURI } from "../../utils/toLocalURI";

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
  list: [] as Live2DModelProfileEx[],
  isLoading: false,
  isReady: false,
});

// enum Live2DModelsListItemMetaType {
//   SystemItem = 0,
//   WorkshopItem,
// }

// interface Live2DModelsListItemMeta {
//   type: Live2DModelsListItemMetaType;
//   workshopItemId: bigint | null;
//   localItemModelDir: string | null;
// }

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
    listState.list = await winApi.loadProfiles();
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

const currentState = reactive({
  current: null as Live2DModelProfileEx | null,
  isLoading: false,
  isReady: false,
});

async function getCurrent() {
  try {
    currentState.isLoading = true;
    currentState.current = await winApi.getCurrentProfile();
    currentState.isReady = true;
  } catch (error) {
  } finally {
    currentState.isLoading = false;
  }
}

async function onCardClick(item: Live2DModelProfileEx) {
  await winApi.setCurrent(item._ModelPath);
  await getCurrent();
}

onMounted(() => {
  getNewList();
  getCurrent();
});
</script>

<style lang="scss" src="./styles/models-list.scss"></style>

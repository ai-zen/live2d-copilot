<template>
  <div class="my-modules">
    <div class="filter-column">
      <el-input :prefix-icon="Search" placeholder="请输入关键字搜索"></el-input>
      <div class="tree-wrapper">
        <el-tree :data="filterState.tree" show-checkbox />
      </div>
    </div>
    <div class="list-column">
      <div class="list-scroll-wrapper">
        <AutoGrid class="list-scroll-content" :list="renderList">
          <template #default="{ item }: { item: Live2DModelProfileEx }">
            <div
              class="card"
              :class="{
                'is-current':
                  item._ModelPath == currentState.current?._ModelPath,
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
      </div>
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
          <!-- <el-option label="评分最高" value="title"></el-option>
          <el-option label="最热门（今年）" value=""></el-option>
          <el-option label="最热门（本月）" value=""></el-option>
          <el-option label="最热门（本周）" value=""></el-option>
          <el-option label="最热门（今日）" value=""></el-option>
          <el-option label="最近" value=""></el-option>
          <el-option label="最多投票" value=""></el-option>
          <el-option label="最多订阅" value=""></el-option> -->
          <el-option
            v-for="(option, index) of sortState.options"
            :key="index"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </div>
    </div>
    <div class="detail-column">
      <div v-if="currentState.current" class="detail-scroll-wrapper">
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

<style lang="scss" scoped>
.my-modules {
  flex-grow: 1;
  display: flex;
}

.filter-column {
  flex-shrink: 0;
  width: 280px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  .tree-wrapper {
    margin-top: 10px;
  }
}

.list-column {
  width: 0;
  flex-grow: 1;
  height: 100%;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  .list-column-bottom {
    height: 52px;
    background-color: var(--el-color-white);
    display: flex;
    align-items: center;
    padding: 0 10px;
    .sort-select {
      margin-left: auto;
    }
  }
}

.detail-column {
  flex-shrink: 0;
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .detail-scroll-wrapper {
    flex-grow: 1;
    height: 0;
    overflow-y: auto;
  }
  .detail-scroll-content {
    display: flex;
    flex-direction: column;
  }
  .image {
    display: block;
    width: 100%;
    aspect-ratio: 1;
  }
  .content {
    box-sizing: border-box;
    padding: 0 10px;

    .count-row {
      height: 36px;
      display: flex;
      align-items: center;
      .count-subscription {
        color: var(--el-color-primary);
        font-size: 14px;
        margin-left: 10px;
      }
      .count-collection {
        color: var(--el-color-danger);
        font-size: 14px;
        margin-left: 10px;
      }
    }

    .button-row {
      display: flex;
      .subscription-button {
        flex-grow: 1;
      }
    }

    .title {
      font-size: 18px;
      line-height: 22px;
      margin-top: 10px;
      color: var(--el-text-color-primary);
    }
    .desc {
      margin-top: 6px;
      font-size: 14px;
      line-height: 22px;
      color: var(--el-text-color-primary);
    }
  }
}

.list-scroll-wrapper {
  height: 0;
  flex-grow: 1;
  overflow-y: scroll;
  .list-scroll-content {
    position: relative;
    z-index: 0;
  }
}

.card {
  width: 100%;
  height: auto;
  aspect-ratio: 200 / 260;
  background-color: #fff;
  box-shadow: var(--el-box-shadow);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  &.is-current {
    .title,
    .desc {
      color: var(--el-color-primary);
    }
  }
  .image {
    display: block;
    width: 100%;
    aspect-ratio: 1;
  }
  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-size: 16px;
    line-height: 22px;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-primary);
    text-align: center;
  }
  .desc {
    font-size: 12px;
    line-height: 16px;
    padding: 0 10px;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    color: var(--el-text-color-primary);
    text-align: center;
  }
}
</style>

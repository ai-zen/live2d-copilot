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
        <div
          class="list-scroll-content"
          :style="{ '--card-width': `${cardWidth}px` }"
          ref="listScrollContentRef"
        >
          <div class="card" v-for="index of 50" :key="index">
            <img class="image" />
            <div class="content">
              <div class="title">模型名称</div>
              <div class="desc">模型描述模型描述模型描述模型描述模型描述</div>
            </div>
          </div>
        </div>
      </div>
      <div class="list-column-bottom">
        <el-pagination
          v-model:current-page="paginationState.currentPage"
          v-model:page-size="paginationState.pageSize"
          :page-sizes="paginationState.pageSizes"
          layout="sizes, total, prev, pager, next"
          :total="400"
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
      <div class="detail-scroll-wrapper">
        <div class="detail-scroll-content">
          <img class="image" />
          <div class="content">
            <div class="count-row">
              <el-rate :modelValue="3" disabled />
              <div class="count-subscription">7.5K订阅</div>
              <div class="count-collection">4.3K收藏</div>
            </div>
            <div class="button-row">
              <el-button class="subscription-button" size="large" type="primary"
                >取消订阅</el-button
              >
            </div>
            <div class="title">模型标题</div>
            <div class="desc">
              模型描述模型描述模型描述模型描述模型描述模型描述模型描述模型描述模型描述模型描述模型描述模型描述
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

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

const paginationState = reactive({
  currentPage: 1,
  pageSize: 50,
  pageSizes: [50, 100, 200],
});

function onSizeChange() {}

function onCurrentChange() {}

const sortState = reactive({
  current: "title",
  options: [
    { label: "按名称排序", value: "title" },
    { label: "按订阅日期排序", value: "subscription-time" },
  ],
});

const cardWidth = ref(150);
const listScrollContentRef = ref<null | HTMLDivElement>(null);

function onResize() {
  if (!listScrollContentRef.value) return;
  const margin = 10;
  const cellWidth = 150 + margin;
  const containerWidth = listScrollContentRef.value.clientWidth - margin;
  const numPerRow = Math.floor(containerWidth / cellWidth);
  cardWidth.value = containerWidth / numPerRow - 10;
}

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
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
    background-color: #888;
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
  overflow: auto;
  .list-scroll-content {
    position: relative;
    z-index: 0;
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
  }
}

.card {
  // flex-grow: 1;
  width: var(--card-width);
  height: auto;
  aspect-ratio: 200 / 280;
  background-color: #fff;
  box-shadow: var(--el-box-shadow);
  margin: 5px;
  border-radius: 8px;
  overflow: hidden;
  .image {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    background-color: #888;
  }
  .title {
    margin-top: 2px;
    font-size: 14px;
    line-height: 22px;
    padding: 0 10px;
  }
  .desc {
    font-size: 12px;
    line-height: 16px;
    padding: 0 10px;
  }
}
</style>

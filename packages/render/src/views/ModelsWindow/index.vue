<template>
  <div class="models-window">
    <el-tabs class="tabs" v-model="activeName">
      <el-tab-pane :label="t('models_window.my_models')" name="MyModels">
        <MyModels></MyModels>
      </el-tab-pane>
      <el-tab-pane :label="t('models_window.workshop')" name="Workshop">
        <Workshop></Workshop>
      </el-tab-pane>
      <el-tab-pane :label="t('models_window.publish')" name="Publish">
        <Publish></Publish>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MyModels from "./MyModels.vue";
import Workshop from "./Workshop.vue";
import Publish from "./Publish.vue";
import { useI18n } from "../../modules/i18n";

const { t } = useI18n();

const activeName = ref("MyModels");
</script>

<style lang="scss" scoped>
.models-window {
  width: 100%;
  height: 100%;
}

.tabs:deep() {
  height: 100%;
  display: flex;
  flex-direction: column;
  .el-tabs__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .el-tab-pane {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
  }
  .el-tabs__header {
    margin: 0px;
  }
  .el-tabs__item.el-tabs__item {
    padding: 0 20px;
  }
}
</style>

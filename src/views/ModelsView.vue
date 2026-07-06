<script setup lang="ts">
import { onMounted } from "vue";
onMounted(() => {
  document.documentElement.classList.add("dark");
});
</script>

<template>
  <div class="window-container">
    <h2>模型管理</h2>
    <el-empty description="模型切换、导入和管理功能即将推出" />
  </div>
</template>

<style scoped>
.window-container {
  padding: 28px;
  height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--el-bg-color);
}
h2 { color: #fff; margin: 0 0 24px; font-size: 18px; }
</style>

<script setup lang="ts">
// 加载窗口由主进程在 Live2D 加载完成后通过 close_loading_window 命令关闭
// 这里不需要主动关闭逻辑
</script>

<template>
  <div class="loading-container">
    <div class="loading-logo">🖥️</div>
    <div class="loading-text">Live2D Copilot</div>
    <div class="loading-spinner"></div>
    <div class="loading-hint">正在初始化...</div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #1e1e1e;
  color: #fff;
  user-select: none;
  -webkit-app-region: drag;
}

.loading-logo {
  font-size: 48px;
  margin-bottom: 12px;
}

.loading-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.loading-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

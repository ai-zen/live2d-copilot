<script setup lang="ts">
defineProps<{
  visible: boolean;
  text: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <Transition name="bubble">
    <div v-if="visible" class="chat-bubble">
      <div class="bubble-content">
        <template v-if="loading && !text">
          <span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </template>
        <template v-else>
          {{ text }}<span v-if="loading" class="cursor">|</span>
        </template>
      </div>
      <button class="bubble-close" @click="emit('close')">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.chat-bubble {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 400px;
  min-width: 60px;
  background: var(--el-bg-color-overlay, rgba(0, 0, 0, 0.75));
  backdrop-filter: blur(10px);
  color: var(--el-text-color-primary, #fff);
  border-radius: 14px;
  padding: 10px 14px;
  padding-right: 30px;
  font-size: 14px;
  line-height: 1.5;
  user-select: text;
  cursor: default;
  pointer-events: auto;
  min-height: 20px;
}

.bubble-close {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  color: var(--el-text-color-placeholder, rgba(255, 255, 255, 0.5));
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.bubble-close:hover {
  color: var(--el-text-color-primary, #fff);
}

.dots span {
  animation: dot-bounce 1.2s infinite;
  font-size: 20px;
  font-weight: bold;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

.cursor {
  animation: blink 0.6s infinite;
  color: var(--el-color-primary, #4a9eff);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>

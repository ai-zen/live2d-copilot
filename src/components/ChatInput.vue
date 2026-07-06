<script setup lang="ts">
import { ref, nextTick } from "vue";

const emit = defineEmits<{
  (e: "send", text: string): void;
}>();

const visible = defineModel<boolean>("visible", { default: true });

const inputRef = ref<HTMLInputElement>();
const text = ref("");

function handleSend() {
  const trimmed = text.value.trim();
  if (!trimmed) return;
  emit("send", trimmed);
  text.value = "";
}

function handleKeydown(ev: KeyboardEvent) {
  if (ev.key === "Enter" && !ev.shiftKey) {
    ev.preventDefault();
    handleSend();
  }
  if (ev.key === "Escape") {
    visible.value = false;
  }
}

function focus() {
  nextTick(() => inputRef.value?.focus());
}

defineExpose({ focus });
</script>

<template>
  <Transition name="input">
    <div v-if="visible" class="chat-input-wrap">
      <input
        ref="inputRef"
        v-model="text"
        class="chat-input"
        placeholder="输入消息..."
        @keydown="handleKeydown"
      />
      <button class="send-btn" @click="handleSend">↑</button>
    </div>
  </Transition>
</template>

<style scoped>
.chat-input-wrap {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--el-bg-color-overlay, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 6px 6px 6px 16px;
  width: 320px;
  pointer-events: auto;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--el-text-color-primary, #fff);
  font-size: 14px;
  outline: none;
  padding: 6px 0;
}
.chat-input::placeholder {
  color: var(--el-text-color-placeholder, rgba(255, 255, 255, 0.4));
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-color-primary, #4a9eff);
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.send-btn:hover {
  background: var(--el-color-primary-light-3, #3a8eee);
}

.input-enter-active,
.input-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.input-enter-from,
.input-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>

<template>
  <div
    class="context-menu"
    v-if="contextMenuState.isShow"
    :style="{
      '--count': menu.length - 1, // the count is excluding close button.
      '--left': `${contextMenuState.position.left}px`,
      '--top': `${contextMenuState.position.top}px`,
    }"
    :class="{ out: contextMenuState.isOut, in: !contextMenuState.isOut }"
  >
    <div
      class="context-menu-item-position"
      v-for="(menuItem, index) of menu"
      :key="index"
      @click="menuItem.click(menuItem)"
      :class="{ 'is-close': menuItem.type == 'close' }"
      :style="{ '--index': index }"
    >
      <div class="context-menu-item" :title="menuItem.title">
        <el-icon>
          <component v-if="menuItem.icon" :is="menuItem.icon" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive } from "vue";
import { guiState } from "./guiState";
import type { CallRecord } from "live2d-copilot-main/src/windows/createDesktopPetWindow";
import { rpc } from "../../modules/rpc";
import { sleep } from "../../utils/sleep";
import {
  Back,
  ChatLineRound,
  Close,
  Cpu,
  MagicStick,
  Setting,
} from "@element-plus/icons-vue";

const winApi = rpc.use<CallRecord>("desktop-pet-window");

const contextMenuState = reactive({
  isShow: false,
  isOut: false,
  position: { left: 0, top: 0 },
});

function onContextMenu(ev: MouseEvent) {
  contextMenuState.position.left = ev.clientX;
  contextMenuState.position.top = ev.clientY;
  contextMenuState.isShow = true;
}

onMounted(() => {
  window.addEventListener("contextmenu", onContextMenu);
});

onUnmounted(() => {
  window.removeEventListener("contextmenu", onContextMenu);
});

interface MenuItem {
  type?: string;
  title: string;
  icon: any;
  click(item: MenuItem): void;
}

const menu = computed<MenuItem[]>(() => [
  {
    title: "插件",
    icon: Cpu,
    click(_item: MenuItem) {
      closeMenu();
    },
  },
  {
    title: "聊天",
    icon: ChatLineRound,
    click(_item: MenuItem) {
      guiState.isShowChatInput = !guiState.isShowChatInput;
      closeMenu();
    },
  },
  {
    title: "设置",
    icon: Setting,
    click(_item: MenuItem) {
      closeMenu();
    },
  },
  {
    title: "退出",
    icon: Back,
    click(_item: MenuItem) {
      closeMenu();
      winApi.quit();
    },
  },
  {
    title: "角色",
    icon: MagicStick,
    click(_item: MenuItem) {
      closeMenu();
    },
  },
  {
    type: "close",
    title: "关闭菜单",
    icon: Close,
    click(_item: MenuItem) {
      closeMenu();
    },
  },
]);

async function closeMenu() {
  contextMenuState.isOut = true;
  await nextTick();
  await sleep(500);
  contextMenuState.isShow = false;
  contextMenuState.isOut = false;
}
</script>

<style lang="scss" scoped>
.context-menu {
  position: absolute;
  width: calc(300px);
  height: calc(300px);
  top: calc(var(--top) - 300px * 0.5);
  left: calc(var(--left) - 300px * 0.5);
}

.context-menu.context-menu {
  pointer-events: none;
}

.context-menu-item {
  cursor: pointer;
  user-select: none;
  width: var(--item-size);
  height: var(--item-size);
  border-radius: 50%;
  background-color: var(--el-color-primary-light-9);
  border: thin solid var(--el-color-primary);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.36s ease-out;
  --offset-y: calc(0px);

  .in & {
    pointer-events: initial;
  }

  .out & {
    pointer-events: none;
  }

  &:hover {
    background-color: var(--el-color-primary);
    border: thin solid var(--el-color-primary);
    color: #fff;
  }

  &:active {
    --offset-y: calc(10px);
  }
}

.context-menu-item-position.is-close .context-menu-item {
  transform: translateY(var(--offset-y));
}

.context-menu-item {
  font-size: calc(30px);
  transform: rotate(calc(-1 * var(--index) / var(--count) * 360deg))
    translateY(var(--offset-y));
}

.context-menu-item-position {
  --item-size: calc(60px);
  position: absolute;
  width: var(--item-size);
  height: var(--item-size);
  border-radius: 50%;
  top: calc((100% - var(--item-size)) * 0.5);
  left: calc((100% - var(--item-size)) * 0.5);
  transform-origin: 50% 50%;
}

.in .context-menu-item-position.is-close {
  animation: content-menu-close-in 0.5s both;
}

.in .context-menu-item-position {
  animation: content-menu-item-in 0.5s both;
}

.out .context-menu-item-position.is-close {
  animation: content-menu-close-out 0.5s both;
}

.out .context-menu-item-position {
  animation: content-menu-item-out 0.5s both;
}

@keyframes content-menu-close-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes content-menu-item-in {
  from {
    transform: rotate(calc(var(--index) / var(--count) * 360deg + 90deg))
      translateY(calc(0px));
    opacity: 0;
  }

  to {
    transform: rotate(calc(var(--index) / var(--count) * 360deg))
      translateY(calc(-100px));
    opacity: 1;
  }
}

@keyframes content-menu-close-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes content-menu-item-out {
  from {
    transform: rotate(calc(var(--index) / var(--count) * 360deg))
      translateY(calc(-100px));
    opacity: 1;
  }

  to {
    transform: rotate(calc(var(--index) / var(--count) * 360deg + 90deg))
      translateY(calc(0px));
    opacity: 0;
  }
}
</style>

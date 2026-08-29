---
title: 功能与架构
description: Live2D Copilot 的完整技术栈、功能清单以及管道式对话数据流说明。
outline: deep
---

# 功能与架构

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 桌面框架 | **Tauri 2**（Rust） | 桌面外壳，窗口/托盘/原生能力 |
| 前端框架 | **Vue 3** + TypeScript | `<script setup>` SFC |
| 构建工具 | **Vite 6** | 前端构建/开发服务器 |
| UI 组件 | **Element Plus** | 设置面板等界面 |
| 路由 | **vue-router** | 多窗口视图 |
| Live2D | `@ai-zen/live2d-vue` | Live2D 渲染 |
| AI 对话 | `@ai-zen/agents-core` | 流式对话（OpenAI / ChatGPT 封装） |
| 队列 | `@ai-zen/async-queue` | 分句 / TTS / 播放的串行队列 |
| 语音合成 | **Edge-TTS**（浏览器 WebSocket 直连） | text → AudioBuffer |
| 音频转换 | 自实现 WAV 编码 | AudioBuffer → PCM WAV Blob |

> Rust 依赖：`tauri`（含 `tray-icon`）、`tokio`、`serde`、`serde_json`、`png`、`raw-window-handle`、`tauri-plugin-opener`；Windows 专属：`webview2-com`、`windows`。

## 功能清单

### 窗口与桌面交互
- **透明无边框桌宠主窗口**：`500×600`、无边框、始终置顶、无阴影、透明背景。
- **加载窗口**：小窗（`320×180`），Live2D 加载完成后由主进程关闭（`close_loading_window`）。
- **系统托盘**：显示/隐藏、模型管理、设置、退出；左键点击托盘亦可切换显示。
- **原生窗口拖动**：前端监听鼠标事件，超过 5px 阈值后调用 `drag_window`（原生 `start_dragging()`）区分点击/拖拽。
- **滚轮缩放模型**（`useLive2D` / Live2D 组件）。
- **鼠标穿透**：`mouse_through.rs` 通过捕获窗口预览并按 alpha 通道透传事件，实现“透明区域点击穿透到桌面”。
- **全局视线追踪**：`gaze.rs` 在 Rust 线程读取光标位置并 `emit("gaze-move")`，前端 `useLive2D` 监听后驱动 Live2D 视线跟随。

### AI 对话
- **流式对话**：基于 `@ai-zen/agents-core`，接入 DeepSeek / ChatGLM。
- **预设模型**：DeepSeek（`deepseek-v4-pro`、`deepseek-v4-flash`）、ChatGLM（`glm-5.2`、`glm-5.1`、`glm-4.7`、`glm-4.7-flash`）。
- **聊天气泡 / 输入框**：`ChatBubble`、`ChatInput`。
- **右键菜单**：模型 / 插件 / 聊天 / 设置 / 退出（列表式、径向动画）。
- **对话系统 prompt**：默认「虹色Mao」人设（见 `profile.json`），可被用户设置的模型覆盖。

### 语音合成与输出
- **Edge-TTS**：浏览器 WebSocket 直连 Bing Edge-TTS 服务，生成 `AudioBuffer`。
- **分句**：`useSentence` 按中文标点（`。！？.!?\n`）切分增量文本。
- **串行合成防乱序**：`useTTS` 使用 `AsyncQueue` 逐条合成。
- **串行播放 + 字幕同步 + 对口型**：`useSpeaker` 串行播放，逐句同步字幕，并通过 `onPlay` 回调驱动 Live2D 对口型（`_wavFileHandler.start(blobUrl)`）。

## 架构：管道式数据流

对话处理采用四段串联的管道（参考 `DesktopPetView.vue`）：

```text
useChat
  └─(流式 delta)→ useSentence（分句）
                     └─(整句)→ useTTS（串行合成）
                                  └─(音频 clip)→ useSpeaker（串行播放 + 字幕 + 对口型）
```

核心队列（来自 `@ai-zen/async-queue`）：

- 各节点以 **`null` 作为流结束标记**：`useSentence` push 到 `useTTS`，`useTTS` push 到 `useSpeaker`，逐级以 `null` 触发 `onEnd` / 状态清理。
- `useSpeaker` 通过 `onPlay(clip)` 通知 Live2D 开始追踪口型，`onPlayed` 在播放完毕后恢复闲置动作。

### 主要模块（前端）
- `src/composables/`：`useChat`、`useSentence`、`useTTS`、`useSpeaker`、`useLive2D`、`useDrag`。
- `src/views/`：`DesktopPetView`（主窗口）、`LoadingView`、`SettingsView`、`ModelsView`、`PluginsView`。
- `src/components/`：`ChatBubble`、`ChatInput`、`ContextMenu`。
- `src/shared/`：`Common`、`Live2DModels`、`Setting`、`Steamworks`、`ChatTool`（跨进程/跨端类型）。
- `src/utils/`：`tts`、`wav`。

### 主要模块（Rust / Tauri）
- `src-tauri/src/lib.rs`：窗口创建、托盘、Tauri Commands（`load_setting` / `save_setting` / `close_loading_window` / 各窗口打开 / `drag_window` / `quit_app`）。
- `src-tauri/src/gaze.rs`：全局视线追踪。
- `src-tauri/src/mouse_through.rs`：透明区域鼠标穿透。

## 扩展点（规划中占位）

- **模型管理窗口**（`ModelsView`）：当前为占位（“即将推出”）。
- **插件窗口**（`PluginsView`）：当前为占位，规划用于 Function Calling 工具配置。
- **Steamworks**：类型定义已在 `shared/Steamworks.ts` 中就绪，但 `steamworks-rs` 集成尚未开始（见进度页）。

## 相关页面

- [产品介绍](./index.md)：产品定位。
- [快速开始](./getting-started.md)：本地运行与构建。
- [开发进度](./progress.md)：已完成 / 待完成与 Steam 计划。

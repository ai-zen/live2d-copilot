---
title: 快速开始
description: 本地运行与构建 Live2D Copilot 的环境要求、命令与配置说明。
outline: deep
---

# 快速开始

本页说明如何在本地环境安装依赖并运行、构建 Live2D Copilot。

## 环境要求

> ⚠️ `package.json` 未声明 `engines`，以下版本为常规开发环境假设，**以实际可运行环境为准**（需人工复核）。

- **Node.js**：建议 LTS 版本（18 或更高）。
- **包管理器**：`pnpm`（仓库使用 `pnpm-lock.yaml`）。
- **Rust 工具链**：需安装 Rust（Tauri 2 依赖，建议 stable 工具链）。
- **平台**：面向桌面。当前 Rust 侧部分能力（鼠标穿透、视线追踪、窗口截图）以 Windows 实现为主（`#[cfg(windows)]`），跨平台支持有限。
- **Tauri 系统依赖**：按 Tauri 2 官方文档安装对应平台的构建依赖。

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

## 开发运行

开发模式下，`tauri dev` 会先通过 `beforeDevCommand` 启动 Vite 前端，再拉起 Tauri 窗口：

```bash
pnpm tauri dev
```

> 说明：`package.json` 中的 `dev` 脚本为 `vite`（仅启动前端），`tauri` 脚本为 `tauri`；完整桌面开发推荐使用 `pnpm tauri dev`。

## 构建

```bash
pnpm tauri build
```

构建前会通过 `beforeBuildCommand` 执行 `pnpm build`（即 `vue-tsc --noEmit && vite build`）做类型检查与前端打包。

## 前端构建（单独）

```bash
pnpm build
```

## 关键配置

- **Tauri 配置**：`src-tauri/tauri.conf.json`（产物名 `Live2D Copilot`、标识符 `com.ai-zen.live2d-copilot`、窗口在 Rust 侧动态创建）。
- **权限声明**：`src-tauri/capabilities/default.json`（`core:default`、`opener:default`）。
- **默认模型**：`public/models/Mao/`（「虹色Mao」）。
- **TTS 语音列表**：`public/voices.json`（Edge-TTS 可用语音，前端缓存读取）。

## 使用前配置

首次使用需在**设置窗口**中配置 AI 服务：

1. 在设置窗口选择模型提供商（DeepSeek / ChatGLM）。
2. 填入对应的 **API Key**。
3. 选择 LLM 模型。
4. 选择 TTS 语音（默认 `zh-CN-XiaoyiNeural`）。
5. 点击「保存设置」。

设置会通过 Tauri Command（`save_setting`）写入应用配置目录下的 `settings.json`，并即时通过 `settings-updated` 事件同步到桌宠窗口。

## 相关页面

- [产品介绍](./index.md)：产品定位与核心特性。
- [功能与架构](./features.md)：技术栈与数据流说明。
- [开发进度](./progress.md)：当前版本与路线图。

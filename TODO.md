# TODO: Live2D Copilot 全新实现

> **定位**: AI 桌宠桌面应用 | Steam 发布  
> **技术栈**: Tauri 2 (Rust) + Vue 3 + TypeScript  
> **原则**: 全新设计，不参考旧项目代码；语音/播报使用 WebView2 免费能力

---

## 📦 一、项目工程

- [ ] **1.1** pnpm workspace monorepo 搭建
  - `packages/shared` — 共享类型（参考旧项目重新设计）
  - `packages/render` — Vue 前端
  - `src-tauri` — Tauri Rust 后端
- [ ] **1.2** 前端依赖
  - Element Plus、Vue Router、Sass
  - `@ai-zen/live2d-vue`（Live2D 渲染）
  - `@ai-zen/chats-core`（AI 聊天抽象）
  - `@ai-zen/async-queue`（流式处理管线）
  - `@microsoft/fetch-event-source`（SSE 流式请求）
  - `highlight.js`（代码高亮）
- [ ] **1.3** Rust 依赖
  - `steamworks`（Steam SDK，来自本地 `C:\Projects\steamworks-rs`）
  - `tokio`（异步运行时）
  - `serde` / `serde_json`（已有）
  - `tauri-plugin-dialog`（文件对话框）
  - `tauri-plugin-fs`（文件系统访问）
  - `tauri-plugin-shell`（如需打开外部链接/文件）

---

## 🪟 二、窗口系统

- [ ] **2.1** 桌宠主窗口
  - 透明无边框、全屏（主显示器工作区大小）、置顶
  - 鼠标穿透（根据 alpha 忽略鼠标事件）
  - 可拖动模型、可滚轮缩放
- [ ] **2.2** 加载窗口（启动过渡）
- [ ] **2.3** 模型管理窗口
- [ ] **2.4** 插件/工具管理窗口
- [ ] **2.5** 设置窗口
- [ ] **2.6** 系统托盘
  - 右键菜单：显示/隐藏桌宠、模型、设置、退出
- [ ] **2.7** 窗口去重逻辑（同路由不复创）

---

## 🎙️ 三、语音识别 & 语音播报（Web Speech API）

> WebView2 内置 `SpeechRecognition` + `SpeechSynthesis`，无需付费 API

- [ ] **3.1** 语音识别模块
  - 基于 `SpeechRecognition` / `webkitSpeechRecognition`
  - 支持持续监听/按键触发两种模式
  - 中文识别（`lang: 'zh-CN'`）
  - 识别结果 → 聊天输入
- [ ] **3.2** 语音合成模块
  - 基于 `SpeechSynthesis`
  - 可选择系统语音包（`getVoices()`）
  - 支持中文语音（如 Microsoft Xiaoxiao 等）
  - 与 Live2D 对口型联动（`onboundary` / `onstart` / `onend` 事件）
- [ ] **3.3** 语音管线设计
  - 聊天流式文本 → 断句 → TTS 播放队列 → 字幕显示 + 口型

---

## 🎭 四、Live2D 集成

- [ ] **4.1** Live2D 渲染
  - `@ai-zen/live2d-vue` 在 Tauri WebView2 中验证兼容性
  - 模型加载与切换
- [ ] **4.2** 模型交互
  - 鼠标拖拽移动模型位置
  - 滚轮缩放模型大小
  - 鼠标跟随（视线追踪）
  - 闲置动作（Idle Motion）/ 随机动作
- [ ] **4.3** 模型对口型
  - 配合 TTS 播放控制口型参数（`WavFileHandler`）
- [ ] **4.4** 模型管理
  - 本地模型仓库（`app_data_dir/Live2D Models/`）
  - `profile.json` 模型描述文件规范
  - 默认模型打包
- [ ] **4.5** 模型配置持久化
  - 位置、缩放、当前模型
  - 字幕/聊天框相对位置

---

## 💬 五、AI 聊天系统

- [ ] **5.1** 聊天核心
  - 流式对话（SSE，GPT-3.5/4 等）
  - 消息上下文管理（System prompt + 最近 N 轮）
  - 多端点支持
- [ ] **5.2** Function Calling / Tool Use
  - AI 可调用注册的工具函数
  - 工具动态发现与执行
  - 执行结果回传 AI
- [ ] **5.3** 聊天 UI（全新设计）
  - 聊天输入框（相对模型位置可拖拽）
  - 字幕气泡（AI 回复逐字/逐句显示）
  - 对话历史面板（可选）

---

## 🎮 六、Steamworks 集成

> 使用 `steamworks-rs`（`C:\Projects\steamworks-rs`），Workshop API 完整

- [ ] **6.1** Steam 客户端初始化
  - `Client::init()` / `Client::init_app(2570090)`
  - 回调循环（`run_callbacks` 在单独线程）
  - 非 Steam 环境降级处理
- [ ] **6.2** Workshop 订阅管理
  - `subscribed_items()` — 获取已订阅物品列表
  - `subscribe_item()` / `unsubscribe_item()` — 订阅/取消订阅
  - `item_state()` — 物品状态（`ItemState` bitflags）
  - `download_item()` — 下载物品
  - `item_download_info()` — 下载进度
  - `item_install_info()` — 安装目录
- [ ] **6.3** Workshop 物品查询
  - `query_all()` / `query_user()` / `query_items()` / `query_item()`
  - 标签过滤（`require_tag` / `exclude_tag`）
  - 分页、排序
- [ ] **6.4** UGC 发布
  - `create_item()` — 创建 Workshop 物品
  - `start_item_update()` → `UpdateHandle` — 更新物品
  - `submit()` + `UpdateWatchHandle` — 提交并监控进度
- [ ] **6.5** 物品状态轮询
  - 定时检查下载/安装状态
  - 自动下载新订阅内容
  - 事件通知前端更新 UI
- [ ] **6.6** 标签体系设计
  - `models` — Live2D 模型
  - `chat_tools` — 聊天工具插件

---

## 🔌 七、插件系统

- [ ] **7.1** 插件规范设计
  - `profile.json` 元数据
  - `index.mjs` 入口（或 WASM？）
  - Function Calling schema 定义
- [ ] **7.2** 插件加载与执行
  - 从 Workshop 安装目录加载
  - 安全沙箱考虑（Tauri 下 JS 动态执行方案）
  - 函数注册 → AI Tool 映射
- [ ] **7.3** 插件 UI
  - 已安装列表
  - Workshop 浏览/搜索

---

## ⚙️ 八、设置系统

- [ ] **8.1** 设置项设计
  - 语言（zh-CN / en）
  - 窗口置顶开关
  - 聊天功能开关
  - 语音识别开关 / 模式
  - TTS 语音选择
  - AI 模型/端点选择
- [ ] **8.2** Rust 端持久化
  - JSON 文件存储在 `app_data_dir`
  - Tauri Command: `get_setting` / `set_setting`
  - 设置变更事件广播

---

## 🌍 九、国际化 (i18n)

- [ ] **9.1** 语言文件
  - 中文 (zh-CN)
  - 英文 (en)
- [ ] **9.2** Vue i18n 集成
- [ ] **9.3** Element Plus 多语言联动

---

## 🎨 十、UI/UX 设计（全新）

- [ ] **10.1** 桌宠主界面
  - Live2D 模型居中全屏
  - 聊天输入框（浮动、可拖拽）
  - 字幕气泡（浮动、可拖拽）
  - 右键圆形菜单
- [ ] **10.2** 模型管理界面
  - 本地模型网格/列表
  - Workshop 浏览
  - 模型预览、切换
- [ ] **10.3** 设置界面
  - 清晰分组
- [ ] **10.4** 插件界面
- [ ] **10.5** 整体视觉风格设计

---

## 🚀 十一、打包与发布

- [ ] **11.1** Windows 打包（msi/nsis）
- [ ] **11.2** Steam 发布准备
  - AppID: 2570090
  - Steamworks SDK 分发
  - Workshop 配置

---

## 📊 实施路线

```
Phase 1: 工程搭建
  ├── monorepo + 依赖 + Tauri 基础配置
  └── 窗口系统（加载窗口 + 桌宠主窗口 + 托盘）

Phase 2: Live2D 渲染（最小可用）
  ├── Live2D 加载与显示
  ├── 模型拖拽/缩放
  └── 默认模型打包

Phase 3: 语音 + 聊天
  ├── Web Speech API: 识别 + 合成
  ├── AI 流式对话
  └── 字幕 + 口型联动

Phase 4: Steamworks
  ├── 初始化 + 回调循环
  ├── Workshop 订阅/下载/安装
  └── UGC 发布

Phase 5: 完善
  ├── 模型管理 UI
  ├── 插件系统
  ├── 设置 UI
  ├── i18n
  └── 打包发布
```

# TODO: Live2D Copilot

> **技术栈**: Tauri 2 (Rust) + Vue 3 + TypeScript  
> **目标**: AI 桌宠桌面应用，Steam 发布

---

## ✅ 已完成

- [x] 项目结构（标准 Tauri 2 单项目）
- [x] 透明无边框窗口（500×600，置顶）
- [x] 加载窗口 → 桌宠窗口启动流程
- [x] 系统托盘（显示/隐藏、模型、设置、退出）
- [x] Live2D 渲染（`@ai-zen/live2d-vue`）
- [x] 滚轮缩放模型
- [x] 鼠标穿透（透明区域点击穿透到桌面，`mouse_through.rs`）
- [x] 原生窗口拖动（`start_dragging()`，5px 阈值区分点击/拖拽）
- [x] 全局视线追踪（Rust 线程 → `emit("gaze-move")` → 前端 `listen`）
- [x] 默认模型 Mao
- [x] 共享类型定义（Live2DModels, Setting, Steamworks, ChatTool）

---

## 🗂️ 待完成

### 一、前端依赖补充

- [ ] `@ai-zen/chats-core`（AI 聊天抽象）
- [ ] `@microsoft/fetch-event-source`（SSE 流式请求）
- [ ] `highlight.js`（代码高亮）
- [ ] Element Plus 集成（`main.ts` 中 `use(ElementPlus)`）

### 二、Rust 依赖补充

- [ ] `steamworks`（来自 `C:\Projects\steamworks-rs`）
- [ ] `tauri-plugin-dialog`
- [ ] `tauri-plugin-fs`

### 三、语音识别 & 语音合成（Web Speech API）

- [ ] 语音识别（`SpeechRecognition`，中文）
- [ ] 语音合成（`SpeechSynthesis`，可选系统语音包）
- [ ] 与 Live2D 对口型联动

### 四、Live2D 增强

- [ ] 闲置动作 / 随机动作
- [ ] 模型切换（多模型管理）
- [ ] 模型配置持久化
- [ ] 字幕气泡 + 聊天输入框 UI

### 五、AI 聊天系统

- [ ] 流式对话（SSE）
- [ ] 消息上下文管理
- [ ] Function Calling / Tool Use
- [ ] 聊天 UI

### 六、Steamworks 集成

- [ ] Steam 初始化（`steamworks-rs`）
- [ ] Workshop 订阅/下载/安装
- [ ] UGC 发布
- [ ] 物品状态轮询

### 七、设置系统

- [ ] Rust 端设置持久化（JSON 文件）
- [ ] Tauri Command: `get_setting` / `set_setting`
- [ ] 设置 UI

### 八、国际化

- [ ] 中文 / 英文语言文件
- [ ] Vue i18n 集成

### 九、其他窗口

- [ ] 模型管理窗口 UI
- [ ] 设置窗口 UI
- [ ] 插件窗口 UI

### 十、打包与发布

- [ ] Windows 打包（msi/nsis）
- [ ] Steam 发布准备

---

## 📊 下一步

```
Phase 3: 语音 + AI 聊天
  ├── Web Speech API: 识别 + 合成
  ├── AI 流式对话
  └── 字幕 + 口型联动

Phase 4: Steamworks
  ├── 初始化 + Workshop 订阅/下载
  └── UGC 发布

Phase 5: 完善
  ├── 设置系统 + UI
  ├── i18n
  └── 打包发布
```

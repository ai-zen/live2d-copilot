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
- [x] AI 聊天（DeepSeek / ChatGLM，`@ai-zen/agents-core`）
- [x] 流式对话 + 分句 + 聊天气泡
- [x] Edge-TTS 语音合成（XiaoxiaoNeural，浏览器 WebSocket 直连）
- [x] 设置面板（API Key、模型选择、语音选择）
- [x] 右键菜单（设置 / 聊天切换）
- [x] 开发模式自动打开 DevTools
- [x] 管道式架构（useChat → useSentence → useTTS → useSpeaker）
- [x] TTS 串行合成防乱序
- [x] null 结束标记模式统一

---

## 🗂️ 待完成

### 一、依赖清理

- [ ] 删除 Rust 端不再使用的 crates（`tokio-tungstenite`、`reqwest` 等 edge-tts 相关）

### 二、Live2D 增强

- [ ] 闲置动作 / 随机动作
- [ ] 对口型（Edge-TTS AudioBuffer → Live2D mouth 参数）
- [ ] 模型切换（多模型管理）
- [ ] 模型配置持久化

### 三、聊天增强

- [ ] Function Calling / Tool Use
- [ ] 消息上下文管理优化
- [ ] 对话历史面板

### 四、Steamworks 集成

- [ ] Steam 初始化（`steamworks-rs`）
- [ ] Workshop 订阅/下载/安装
- [ ] UGC 发布

### 五、设置系统

- [ ] Rust 端设置持久化（JSON 文件）
- [ ] Tauri Command: `get_setting` / `set_setting`
- [ ] 设置窗口 UI（完善）

### 六、国际化

- [ ] 中文 / 英文语言文件

### 七、其他窗口

- [ ] 模型管理窗口 UI
- [ ] 插件窗口 UI

### 八、打包与发布

- [ ] Windows 打包（msi/nsis）
- [ ] Steam 发布准备

---

## 📊 下一步

```
Phase 4: Live2D 增强
  ├── 闲置动作 / 随机动作
  ├── 对口型（Edge-TTS AudioBuffer → Live2D mouth）
  └── 模型切换 + 配置持久化

Phase 5: Steamworks
  └── Workshop 集成

Phase 6: 完善
  ├── 设置持久化（Rust JSON）+ UI
  ├── i18n
  └── 打包发布
```

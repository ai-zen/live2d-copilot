---
title: Development Progress
description: Current version status, done/TODO checklist, and Steam release roadmap for Live2D Copilot.
outline: deep
---

# Development Progress

> Source: the repository `TODO.md` and the current source implementation. **Progress may lag behind actual development**; rely on `git log` or the latest code (requires manual review).

## Current version

- **Version**: `0.1.0` (consistent across `package.json` / `Cargo.toml` / `tauri.conf.json`).
- **Product name**: `Live2D Copilot`; **identifier**: `com.ai-zen.live2d-copilot`.
- **Development branch**: `tauri` (`git status` shows `On branch tauri`, in sync with `origin/tauri`).

## Done

The following are implemented (based on checked `TODO.md` items and the source):

- [x] Project structure (standard single-project Tauri 2).
- [x] Transparent borderless window (500×600, always on top).
- [x] Loading window → desktop pet window startup flow.
- [x] System tray (show/hide, model, settings, exit).
- [x] Live2D rendering (`@ai-zen/live2d-vue`).
- [x] Mouse-wheel model zoom.
- [x] Mouse passthrough (transparent regions click through to the desktop, `mouse_through.rs`).
- [x] Native window dragging (`start_dragging()`, 5px threshold to distinguish click/drag).
- [x] Global gaze tracking (Rust thread → `emit("gaze-move")` → frontend `listen`).
- [x] Default model Mao.
- [x] Shared type definitions (`Live2DModels`, `Setting`, `Steamworks`, `ChatTool`).
- [x] AI chat (DeepSeek / ChatGLM, `@ai-zen/agents-core`).
- [x] Streaming conversation + sentence segmentation + chat bubbles.
- [x] Edge-TTS speech synthesis (XiaoxiaoNeural etc., direct browser WebSocket connection).
- [x] Settings panel (API Key, model selection, voice selection).
- [x] Right-click menu (Settings / chat toggle / Model / Plugins / Exit).
- [x] Auto-open DevTools in dev mode.
- [x] Pipeline architecture (`useChat` → `useSentence` → `useTTS` → `useSpeaker`).
- [x] TTS serial synthesis to avoid out-of-order.
- [x] Unified `null` end-marker pattern.

## TODO

Based on the categories in `TODO.md`:

### 1. Dependency cleanup
- [ ] Remove Rust-side crates no longer used (`tokio-tungstenite`, `reqwest`, etc. related to edge-tts). *(Note: these crates are no longer present in the current `Cargo.toml`; they may already be cleaned up or never introduced — needs review.)*

### 2. Live2D enhancements
- [ ] Idle / random actions.
- [ ] Lip sync (Edge-TTS AudioBuffer → Live2D mouth parameters). *(Note: the source already triggers lip-sync playback via `_wavFileHandler.start(blobUrl)`; whether it is fully in place needs review.)*
- [ ] Model switching (multi-model management).
- [ ] Model configuration persistence.

### 3. Chat enhancements
- [ ] Function Calling / Tool Use.
- [ ] Message context management optimization.
- [ ] Conversation history panel.

### 4. Steamworks integration
- [ ] Steam initialization (`steamworks-rs`).
- [ ] Workshop subscription/download/install.
- [ ] UGC publishing.

### 5. Settings system
- [ ] Rust-side settings persistence (JSON file). *(Note: `lib.rs` already implements `load_setting`/`save_setting` writing `settings.json`; this may already have progressed — needs review.)*
- [ ] Tauri Command: `get_setting` / `set_setting`. *(Note: currently named `load_setting`/`save_setting`; naming differs, needs review.)*
- [ ] Settings window UI (polish).

### 6. i18n
- [ ] Chinese / English language files.

### 7. Other windows
- [ ] Model management window UI (currently placeholder).
- [ ] Plugin window UI (currently placeholder).

### 8. Packaging & release
- [ ] Windows packaging (msi / nsis).
- [ ] Steam release preparation.

## Steam release plan

The target is a **Steam** release, currently in the **to-be-developed / not implemented** stage:

- **Steamworks**: `shared/Steamworks.ts` already defines the relevant types (`ItemTypeTag`, `ItemState`, `DownloadInfo`, `InstallInfo`, `WorkshopItemExt`, `UGCPublishForm`), which is a **frontend type reservation**; the **Rust-side `steamworks-rs` integration has not started**.
- **Workshop / UGC**: subscription, download, install, and UGC publishing are all TODO items.
- **Windows packaging** (msi / nsis) and Steam release preparation are in the "Packaging & release" TODO.

## Roadmap (Phase planning)

```
Phase 4: Live2D enhancements
  ├── Idle / random actions
  ├── Lip sync (Edge-TTS AudioBuffer → Live2D mouth)
  └── Model switching + config persistence

Phase 5: Steamworks
  └── Workshop integration

Phase 6: Polish
  ├── Settings persistence (Rust JSON) + UI
  ├── i18n
  └── Packaging & release
```

## Related pages

- [Product Overview](./index.md): Product positioning.
- [Quick Start](./getting-started.md): Environment requirements and running.
- [Features & Architecture](./features.md): Tech stack and data flow.

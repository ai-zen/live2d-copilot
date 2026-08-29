---
title: Features & Architecture
description: The complete tech stack, feature list, and pipeline-style conversation data flow of Live2D Copilot.
outline: deep
---

# Features & Architecture

## Tech stack

| Layer | Technology | Description |
|----|------|------|
| Desktop framework | **Tauri 2** (Rust) | Desktop shell, window/tray/native capabilities |
| Frontend framework | **Vue 3** + TypeScript | `<script setup>` SFC |
| Build tool | **Vite 6** | Frontend build/dev server |
| UI components | **Element Plus** | Settings panel and other UI |
| Router | **vue-router** | Multi-window views |
| Live2D | `@ai-zen/live2d-vue` | Live2D rendering |
| AI conversation | `@ai-zen/agents-core` | Streaming conversation (OpenAI / ChatGPT wrapper) |
| Queue | `@ai-zen/async-queue` | Serial queue for sentence segmentation / TTS / playback |
| Speech synthesis | **Edge-TTS** (direct browser WebSocket) | text → AudioBuffer |
| Audio conversion | Custom WAV encoding | AudioBuffer → PCM WAV Blob |

> Rust dependencies: `tauri` (incl. `tray-icon`), `tokio`, `serde`, `serde_json`, `png`, `raw-window-handle`, `tauri-plugin-opener`; Windows-specific: `webview2-com`, `windows`.

## Feature list

### Window & desktop interaction
- **Transparent, borderless desktop pet main window**: `500×600`, borderless, always on top, no shadow, transparent background.
- **Loading window**: small window (`320×180`), closed by the main process once Live2D loading finishes (`close_loading_window`).
- **System tray**: show/hide, model management, settings, exit; left-clicking the tray icon also toggles visibility.
- **Native window dragging**: the frontend listens to mouse events and, after a threshold of >5px, calls `drag_window` (native `start_dragging()`) to distinguish click vs. drag.
- **Mouse-wheel model zoom** (`useLive2D` / Live2D component).
- **Mouse passthrough**: `mouse_through.rs` captures the window preview and passes events through based on the alpha channel, so "transparent regions let clicks pass through to the desktop."
- **Global gaze tracking**: `gaze.rs` reads the cursor position in a Rust thread and `emit("gaze-move")`; the frontend `useLive2D` listens and drives Live2D gaze following.

### AI conversation
- **Streaming conversation**: Based on `@ai-zen/agents-core`, connecting DeepSeek / ChatGLM.
- **Preset models**: DeepSeek (`deepseek-v4-pro`, `deepseek-v4-flash`), ChatGLM (`glm-5.2`, `glm-5.1`, `glm-4.7`, `glm-4.7-flash`).
- **Chat bubble / input box**: `ChatBubble`, `ChatInput`.
- **Right-click menu**: Model / Plugins / Chat / Settings / Exit (list-style, radial animation).
- **Conversation system prompt**: Default "虹色Mao" persona (see `profile.json`), which can be overridden by the user-selected model.

### Speech synthesis and output
- **Edge-TTS**: Direct browser WebSocket connection to the Bing Edge-TTS service, generating `AudioBuffer`.
- **Sentence segmentation**: `useSentence` splits incremental text by Chinese punctuation (`。！？.!?\n`).
- **Serial synthesis to avoid out-of-order**: `useTTS` synthesizes item by item using `AsyncQueue`.
- **Serial playback + subtitle sync + lip sync**: `useSpeaker` plays serially, syncs subtitles sentence by sentence, and drives Live2D lip sync via the `onPlay` callback (`_wavFileHandler.start(blobUrl)`).

## Architecture: pipeline-style data flow

Conversation handling uses a four-stage serial pipeline (see `DesktopPetView.vue`):

```text
useChat
  └─(streaming delta)→ useSentence (sentence segmentation)
                     └─(full sentence)→ useTTS (serial synthesis)
                                  └─(audio clip)→ useSpeaker (serial playback + subtitles + lip sync)
```

Core queues (from `@ai-zen/async-queue`):

- Each node uses **`null` as the stream-end marker**: `useSentence` pushes to `useTTS`, `useTTS` pushes to `useSpeaker`, each triggering `onEnd` / state cleanup level by level with `null`.
- `useSpeaker` notifies Live2D to start tracking lip sync via `onPlay(clip)`, and `onPlayed` restores idle actions after playback finishes.

### Main modules (frontend)
- `src/composables/`: `useChat`, `useSentence`, `useTTS`, `useSpeaker`, `useLive2D`, `useDrag`.
- `src/views/`: `DesktopPetView` (main window), `LoadingView`, `SettingsView`, `ModelsView`, `PluginsView`.
- `src/components/`: `ChatBubble`, `ChatInput`, `ContextMenu`.
- `src/shared/`: `Common`, `Live2DModels`, `Setting`, `Steamworks`, `ChatTool` (cross-process/cross-end types).
- `src/utils/`: `tts`, `wav`.

### Main modules (Rust / Tauri)
- `src-tauri/src/lib.rs`: Window creation, tray, Tauri Commands (`load_setting` / `save_setting` / `close_loading_window` / open various windows / `drag_window` / `quit_app`).
- `src-tauri/src/gaze.rs`: Global gaze tracking.
- `src-tauri/src/mouse_through.rs`: Transparent-region mouse passthrough.

## Extension points (planned placeholders)

- **Model management window** (`ModelsView`): Currently a placeholder ("coming soon").
- **Plugin window** (`PluginsView`): Currently a placeholder; planned for Function Calling tool configuration.
- **Steamworks**: Type definitions are already ready in `shared/Steamworks.ts`, but the `steamworks-rs` integration has not started (see the progress page).

## Related pages

- [Product Overview](./index.md): Product positioning.
- [Quick Start](./getting-started.md): Local run and build.
- [Development Progress](./progress.md): Done / TODO items and Steam plan.

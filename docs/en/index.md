---
title: Product Overview
description: Live2D Copilot is a desktop pet application based on Live2D and AI, supporting conversational interaction and speech synthesis, planned for release on Steam.
outline: deep
---

# Live2D Copilot Product Overview

## Overview

Live2D Copilot is an **AI desktop pet (Live2D)** application being developed by AI-Zen. It is centered on an always-present-on-desktop Live2D character (default model: "虹色Mao"), integrating AI conversation, streaming speech synthesis (TTS), and desktop-level interaction capabilities. The goal is to create a desktop companion you can "see, hear, and talk to."

- **Product positioning**: Desktop-side AI assistant / desktop pet.
- **Target platform**: Desktop (Windows first, based on Tauri 2).
- **Release plan**: Intended for release on **Steam** (see "Development Progress").
- **Current version**: `0.1.0` (early development version).
- **Package name**: `live2d-copilot` (`private: true` in `package.json`; it is a desktop application project, not a library published to npm).

## What problem does it solve

Traditional assistants are mostly page/tool-shaped; Live2D Copilot attempts to provide companionship and efficiency value in the form of an "anthropomorphic character":

- A Live2D character resident on the desktop that can "look at you," "speak," be draggable, and let mouse events pass through it.
- Through conversation and TTS, it forms a "speak—listen—answer" closed-loop interactive experience.
- While acting as a desktop pet, it stays lightweight and can be operated directly on the desktop.

## Core features at a glance

- **Transparent, borderless desktop pet window**: 500×600, always on top, no border.
- **Live2D rendering**: Based on `@ai-zen/live2d-vue`, default model "虹色Mao".
- **AI conversation**: Connects DeepSeek / ChatGLM with streaming output.
- **Speech synthesis**: Edge-TTS (direct browser WebSocket connection).
- **Desktop interaction**: System tray, native window dragging, mouse-wheel zoom, mouse passthrough, global gaze tracking.
- **Settings panel**: Configure API Key, model, and TTS voice.

## Current status

- Version `0.1.0`.
- This is an **early development version**; the overall architecture and the core conversation pipeline are in place.
- Model management, plugin management, settings persistence, i18n, and Steam integration are still **TODO** items (see the progress page).

## Related pages

- [Quick Start](./getting-started.md): Environment requirements, installing dependencies, running and building.
- [Features & Architecture](./features.md): Tech stack, feature list, and pipeline-style data flow.
- [Development Progress](./progress.md): Done / TODO checklist and Steam release roadmap.

## Points requiring manual review

- **License**: Neither the repository nor `package.json` declares a license (the task description notes "license not public").
- **README**: The repository root `README.md` still contains the **default template** content for Tauri + Vue + TypeScript, not a real project introduction; it is recommended to update it later.
- **Publishing**: `package.json` has `private: true`, so this is a desktop application project **not published to npm**.
- **Environment requirements**: `package.json` does not declare `engines`; the exact minimum Node/Pnpm/Rust versions depend on the actual development environment (see Quick Start).

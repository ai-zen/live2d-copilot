---
title: Quick Start
description: Environment requirements, commands, and configuration for running and building Live2D Copilot locally.
outline: deep
---

# Quick Start

This page explains how to install dependencies and run/build Live2D Copilot in a local environment.

## Environment requirements

> ⚠️ `package.json` does not declare `engines`; the following versions are assumptions for a typical dev environment. **Use the actual runnable environment as the source of truth** (requires manual review).

- **Node.js**: An LTS version is recommended (18 or higher).
- **Package manager**: `pnpm` (the repository uses `pnpm-lock.yaml`).
- **Rust toolchain**: Rust must be installed (required by Tauri 2; a stable toolchain is recommended).
- **Platform**: Target platform is desktop. Currently, some of the Rust-side capabilities (mouse passthrough, gaze tracking, window screenshot) are mainly implemented on Windows (`#[cfg(windows)]`), so cross-platform support is limited.
- **Tauri system dependencies**: Install the build dependencies for your platform per the Tauri 2 official documentation.

## Install dependencies

Run in the repository root:

```bash
pnpm install
```

## Development run

In dev mode, `tauri dev` first starts the Vite frontend via `beforeDevCommand`, then brings up the Tauri window:

```bash
pnpm tauri dev
```

> Note: In `package.json`, the `dev` script is `vite` (frontend only), and the `tauri` script is `tauri`. For full desktop development, `pnpm tauri dev` is recommended.

## Build

```bash
pnpm tauri build
```

Before building, `pnpm build` (i.e., `vue-tsc --noEmit && vite build`) is run via `beforeBuildCommand` for type checking and frontend bundling.

## Frontend build (standalone)

```bash
pnpm build
```

## Key configuration

- **Tauri configuration**: `src-tauri/tauri.conf.json` (product name `Live2D Copilot`, identifier `com.ai-zen.live2d-copilot`; the window is created dynamically on the Rust side).
- **Permissions declaration**: `src-tauri/capabilities/default.json` (`core:default`, `opener:default`).
- **Default model**: `public/models/Mao/` ("虹色Mao").
- **TTS voice list**: `public/voices.json` (available Edge-TTS voices, read and cached by the frontend).

## Configuration before use

On first use, you need to configure the AI service in the **Settings window**:

1. Choose the model provider (DeepSeek / ChatGLM) in the Settings window.
2. Fill in the corresponding **API Key**.
3. Select the LLM model.
4. Select a TTS voice (default `zh-CN-XiaoyiNeural`).
5. Click "Save Settings".

The settings are written to `settings.json` under the app config directory via the Tauri Command (`save_setting`), and are immediately synced to the desktop pet window through the `settings-updated` event.

## Related pages

- [Product Overview](./index.md): Product positioning and core features.
- [Features & Architecture](./features.md): Tech stack and data flow.
- [Development Progress](./progress.md): Current version and roadmap.

# Live2D Copilot

An AI Desktop Pet

## Getting Started

1. Open the project root directory in VSCode.

2. Enable corepack by running the following command in the VSCode terminal:

   ```
   corepack enable
   ```

3. Install npm dependencies using pnpm. Run the following command in the VSCode terminal:

   ```
   pnpm i
   ```

4. Using `Start Debugging` in vscode (the hotkey is usually `F5`).

## Project Status

This is a brand new project, the old one has been abandoned.

- **Live2D**: 100% complete.

- **Workshop**: 100% complete. Due to the lack of important features in upstream projects (steamworks.js, steamworks-rs), some necessary functions had to be added from scratch.

- **Chat**: 80% complete. I has accumulated a significant amount of code for this functionality from various other projects and it will soon be added to this repository (including chat functionality, function calling, networking, file reading and writing, etc.).

- **Plugins**: 20% complete. This project plans to design plugins system, that expand the chat functionality, as well as small tool implemented with nodejs + web. Similarly, I has accumulated a significant amount of code for this functionality and will soon be added to this repository.

## Note

- This project has not been released, so many developers cannot run it directly.
- This project will be released on Steam after completion.
- This project relies on some features in Steam, especially the Workshop.

For developers who are not whitelisted, you can try manually changing the APPID from `2570090` to `480` in `packages/main/src/modules/steamworksManager.ts`.
Alternatively, you can comment out `this._client = steamworks.init(this.APP_ID);`.
This will allow the project to run normally.

In addition, in the latest version (as of 2024/01/16), it is possible to launch this project without starting Steam. During the launch process, you will receive a warning but it will not cause startup failure or freezing.

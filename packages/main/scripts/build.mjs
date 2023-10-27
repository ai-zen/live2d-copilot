import * as esbuild from "esbuild";
import fsp from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { getArg, spawnp } from "./utils.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(argv) {
  const BUILD_MODE = getArg(argv, "--mode") || "development";
  const MAIN_DIR = path.resolve(__dirname, "../");
  const DIST_DIR = path.resolve(MAIN_DIR, "dist");
  const PUBLIC_DIR = path.resolve(MAIN_DIR, "public");
  const RENDER_DIR = path.resolve(MAIN_DIR, "../render");
  const LIVE2D_ASSETS_DIR = path.resolve(MAIN_DIR, "../live2d-assets");

  // Clear the dist folder
  console.log("[build.mjs] clear dist dir");
  try {
    await fsp.rm(DIST_DIR, { recursive: true });
    await fsp.mkdir(DIST_DIR, { recursive: true });
  } catch (error) {
    console.log("[build.mjs] clear dist error", error.message);
  }

  // Copy Web static resources
  if (BUILD_MODE == "production" || BUILD_MODE == "prerelease") {
    // Build Web static resources
    console.log("[build.mjs] build web static");
    await spawnp("npm run build", {
      cwd: RENDER_DIR,
      shell: true,
      stdio: "inherit",
    });

    // Copy Web static resources
    console.log("[build.mjs] copy web static dist");
    await fsp.cp(
      path.resolve(RENDER_DIR, "dist"),
      path.resolve(DIST_DIR, "static"),
      { recursive: true }
    );
  }

  // Copy Public files
  console.log("[build.mjs] copy public files");
  await fsp.cp(PUBLIC_DIR, DIST_DIR, { recursive: true });

  // Copy Live2D assets
  console.log("[build.mjs] Copy Live2D assets");
  await fsp.cp(
    path.resolve(LIVE2D_ASSETS_DIR, "models"),
    path.resolve(DIST_DIR, "toUserData/Live2D Models"),
    { recursive: true }
  );

  // Build main and preload
  console.log("[build.mjs] build 'main' and 'payload'");
  await Promise.all([
    esbuild.build({
      entryPoints: ["./src/main.ts"],
      bundle: true,
      platform: "node",
      outfile: "./dist/main.js",
      target: "es2017",
      format: "cjs",
      external: ["electron"],
      define: {
        "process.env.BUILD_MODE": JSON.stringify(BUILD_MODE),
      },
    }),
    esbuild.build({
      entryPoints: ["./src/preload.ts"],
      bundle: true,
      platform: "browser",
      outfile: "./dist/preload.js",
      target: "es2017",
      format: "iife",
      external: ["electron"],
      define: {
        "process.env.BUILD_MODE": JSON.stringify(BUILD_MODE),
      },
    }),
  ]);

  console.log("[build.mjs] build completed.");
}

await main(process.argv);

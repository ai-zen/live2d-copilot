import * as esbuild from "esbuild";
import fsp from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { getArg, hasArg, spawnp } from "./utils.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(argv) {
  const IS_WATCH = hasArg(argv, "--watch");
  const BUILD_MODE = getArg(argv, "--mode") || "development";
  const MAIN_DIR = path.resolve(__dirname, "../");
  const DIST_DIR = path.resolve(MAIN_DIR, "dist");
  const PUBLIC_DIR = path.resolve(MAIN_DIR, "public");
  const RENDER_DIR = path.resolve(MAIN_DIR, "../render");

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

  // Build main and preload
  console.log("[build.mjs] build 'main' and 'payload'");
  await Promise.all([
    (async () => {
      /**
       * @type {import('esbuild').BuildOptions}
       */
      const options = {
        entryPoints: ["./src/main.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/main.js",
        target: "es2017",
        format: "cjs",
        external: ["electron", "steamworks.js"],
        define: {
          "process.env.BUILD_MODE": JSON.stringify(BUILD_MODE),
        },
        sourcemap: true,
        plugins: [
          {
            name: "log",
            setup(build) {
              build.onStart(() => {
                console.log(
                  `[build.mjs] build started ${options.entryPoints[0]}`
                );
              });
              build.onEnd((result) => {
                console.log(
                  `[build.mjs] build ended ${options.entryPoints[0]}`
                );
              });
            },
          },
        ],
      };
      if (IS_WATCH) {
        await esbuild.context(options).then((ctx) => ctx.watch());
      } else {
        await esbuild.build(options);
      }
    })(),
    (async () => {
      /**
       * @type {import('esbuild').BuildOptions}
       */
      const options = {
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
        sourcemap: true,
        plugins: [
          {
            name: "log",
            setup(build) {
              build.onStart(() => {
                console.log(
                  `[build.mjs] build started ${options.entryPoints[0]}`
                );
              });
              build.onEnd((result) => {
                console.log(
                  `[build.mjs] build ended ${options.entryPoints[0]}`
                );
              });
            },
          },
        ],
      };
      if (IS_WATCH) {
        await esbuild.context(options).then((ctx) => ctx.watch());
      } else {
        await esbuild.build(options);
      }
    })(),
  ]);
}

await main(process.argv);

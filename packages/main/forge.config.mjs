export default {
  packagerConfig: {
    asar: false,
    prune: false,
    ignore: [
      /^\/node_modules/,
      /^\/out/,
      /^\/src/,
      /^\/public/,
      /^\/scripts/,
      /^\/.gitignore/,
      /^\/forge.config.js/,
      /^\/tsconfig.json/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [],
};

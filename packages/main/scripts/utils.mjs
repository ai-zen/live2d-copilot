import child_process from "node:child_process";

/**
 * spawnp
 * @param {string} command
 * @param {child_process.SpawnOptionsWithoutStdio | undefined} options
 */
export function spawnp(command, options) {
  return new Promise((resolve, reject) => {
    const child = child_process.spawn(command, options);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${command} exited with code ${code}`));
      }
    });
    process.on("exit", () => {
      child.kill();
    });
  });
}

export function getArg(argv, key) {
  const index = argv.indexOf(key);
  if (index != -1) {
    return argv[index + 1];
  }
}

export function hasArg(argv, key) {
  return argv.includes(key);
}
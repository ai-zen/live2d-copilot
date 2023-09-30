import child_process from "node:child_process";

export function spawnp(command, options) {
  return new Promise((resolve, reject) => {
    const childProcess = child_process.spawn(command, options);

    childProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command ${command} ${options.join(" ")} exited with code ${code}`
          )
        );
      }
    });

    childProcess.on("error", (err) => {
      reject(err);
    });

    process.on("exit", () => {
      childProcess.kill();
    });
  });
}

export function getArg(argv, key) {
  const index = argv.indexOf(key);
  if (index != -1) {
    return argv[index + 1];
  }
}

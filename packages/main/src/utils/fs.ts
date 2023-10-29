import * as fsp from "node:fs/promises";
import * as path from "node:path";

/**
 * This function is used as a workaround for the lack
 * of support for asar in fs.cp in Electron.
 * It performs copying of a folder.
 */
export async function copyFolder(
  src: string, // The source directory path.
  dest: string, // The destination directory path.
  { overwrite = true } = {} // An optional object parameter with a default value of { overwrite: true }.
) {
  try {
    const stats = await fsp.stat(src); // Get the file system stats of the source directory.
    if (!stats.isDirectory()) {
      // If the source is not a directory, throw an error.
      throw new Error(`${src} is not a directory`);
    }

    const files = await fsp.readdir(src); // Get the list of files and directories in the source directory.

    await fsp.mkdir(dest, { recursive: true }); // Create the destination directory recursively if it doesn't already exist.

    for (const file of files) {
      // Iterate through each file and directory in the source directory.
      const srcPath = path.join(src, file); // Create the absolute path of the current file or directory in the source directory.
      const destPath = path.join(dest, file); // Create the absolute path of the current file or directory in the destination directory.
      const fileStats = await fsp.stat(srcPath); // Get the file system stats of the current file or directory.

      if (fileStats.isDirectory()) {
        // If the current item is a directory, recursively call copyFolder with the directory paths.
        await copyFolder(srcPath, destPath, { overwrite });
      } else {
        if (overwrite || !(await fileExists(destPath))) {
          // If overwrite is true or the destination file does not exist, copy the file.
          await fsp.copyFile(srcPath, destPath); // Copy the current file to the destination directory.
        }
      }
    }
  } catch (err) {
    // If any error occurs during the process, catch and log the error.
    console.error(err);
  }
}

export async function fileExists(path: string) {
  // Function to check if a file exists at the specified path.
  try {
    await fsp.access(path); // Check if the file exists by trying to access its attributes.
    return true; // If the file exists, return true.
  } catch (err) {
    // If an error occurs during the process, catch and return false.
    return false; // If the file does not exist, return false.
  }
}

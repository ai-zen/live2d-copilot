import type { AddressInfo } from "node:net";
import path from "node:path";
import http from "node:http";
import fsp from "node:fs/promises";
import fs from "node:fs";
import mime from "mime";

/**
 * Create a simple static server
 */
export async function createStaticServe(root: string) {
  return new Promise<
    http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  >((resolve, reject) => {
    const serve = http.createServer(async (req, res) => {
      console.log("req.url", req.url);

      let filePath = "";

      const tryPaths = [
        path.join(root, req.url!),
        path.join(root, req.url!, "/index.html"),
        path.join(root, "/index.html"),
      ];

      for (let index = 0; index < tryPaths.length; index++) {
        const tryPath = tryPaths[index];
        console.log(tryPath);
        try {
          const stat = await fsp.stat(tryPath);
          if (stat.isFile()) {
            filePath = tryPath;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (filePath) {
        const contentType =
          mime.getType(filePath) || "application/octet-stream";
        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Error 404: Not Found");
      }
    });

    serve.listen(0);

    serve.on("listening", () => {
      console.log(`Server running at`, serve.address());
      resolve(serve);
    });

    serve.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Use the static server origin
 */
export async function useStaticServeOrigin() {
  let staticServeOrigin: string;
  if (
    process.env.BUILD_MODE == "production" ||
    process.env.BUILD_MODE == "prerelease"
  ) {
    // When in production or prerelease mode, create a temporary static server
    const localServe = await createStaticServe(path.join(__dirname, "./static"));
    const info = localServe.address() as AddressInfo;
    staticServeOrigin = `http://127.0.0.1:${info.port}`;
  } else {
    // When in development mode, use the vite development server
    staticServeOrigin = `http://localhost:5173`;
  }

  return { staticServeOrigin };
}
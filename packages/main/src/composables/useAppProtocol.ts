import { net, protocol } from "electron";
import path from "path";

export function useAppProtocol() {
  // Register "app" protocol with app privileges, so that files can be accessed using app://file?path=filepath.
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "app",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
    },
  ]);

  // Provide a handler function to handle the protocol when app.whenReady().then is called.
  function handleAppProtocol() {
    protocol.handle("app", async (request) => {
      const { host, searchParams } = new URL(request.url);

      // app://file?path=
      if (host === "file") {
        const filePathEncoded = searchParams.get("path");

        if (!filePathEncoded) {
          // Return 404 error if path parameter is missing.
          return new Response(null, { status: 404 });
        }

        const filePath = decodeURIComponent(filePathEncoded);

        try {
          // Try to fetch the file's Response.
          console.log("[AppProtocol]", `file:///${path.normalize(filePath)}`);
          const response = await net.fetch(
            `file:///${path.normalize(filePath)}`
          );
          return response;
        } catch (error) {
          // Return 404 error if file fetching fails.
          return new Response(null, { status: 404 });
        }
      } else {
        // Return 404 error if it is not the app://file protocol.
        return new Response(null, { status: 404 });
      }
    });
  }

  return {
    handleAppProtocol,
  };
}
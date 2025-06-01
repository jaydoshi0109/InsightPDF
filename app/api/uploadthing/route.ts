// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // The config is now handled in the uploadthing.ts file
});

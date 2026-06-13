import { join } from "path";
import { existsSync, statSync } from "fs";

const ROOT = join(import.meta.dir, "..", "..");
const BUILD_DIR = join(ROOT, "build");
const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";

if (!existsSync(BUILD_DIR)) {
  console.error("Build directory not found. Run `bun run ssg:build` first.");
  process.exit(1);
}

function resolvePath(urlPath: string): string {
  if (urlPath === "/") return join(BUILD_DIR, "index.html");
  let filePath = join(BUILD_DIR, urlPath);
  if (!existsSync(filePath)) {
    filePath = join(BUILD_DIR, "404.html");
  } else if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  return filePath;
}

Bun.serve({
  port: PORT,
  hostname: HOST,
  fetch(req) {
    const url = new URL(req.url);
    const filePath = resolvePath(url.pathname);
    if (!existsSync(filePath)) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(Bun.file(filePath));
  },
});

console.log(`ssg serve → http://${HOST}:${PORT}`);

import { existsSync, readdirSync, statSync, mkdirSync, rmSync, copyFileSync, readFileSync } from "fs";
import { join, extname, dirname } from "path";

const CONTENT_DIR = join(import.meta.dir, "..", "content");
const EDITOR_SRC = join(import.meta.dir, "..", "editor", "static");
const EDITOR_DIR = join(import.meta.dir, "..", "editor", "public");
const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

function copyEditorStatic() {
  if (!existsSync(EDITOR_SRC)) return;
  mkdirSync(EDITOR_DIR, { recursive: true });
  for (const name of readdirSync(EDITOR_SRC)) {
    if (name.startsWith(".")) continue;
    const src = join(EDITOR_SRC, name);
    const dst = join(EDITOR_DIR, name);
    if (statSync(src).isDirectory()) continue;
    copyFileSync(src, dst);
  }
}

function extractWeight(filePath: string): number | undefined {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (match) {
      const weightMatch = match[1].match(/^weight:\s*(\d+)/m);
      if (weightMatch) return parseInt(weightMatch[1], 10);
    }
  } catch {}
  return undefined;
}

function buildTree(dir: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!existsSync(dir)) return result;
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      const children = buildTree(full);
      if (Object.keys(children).length > 0) result[name] = children;
    } else if (name.endsWith(".md")) {
      const weight = extractWeight(full);
      result[name] = weight != null ? { weight } : null;
    }
  }
  return result;
}

copyEditorStatic();

if (!existsSync(join(EDITOR_DIR, "app.js"))) {
  Bun.spawnSync(["bun", "run", "build"], {
    cwd: join(import.meta.dir, "..", "editor"),
  });
}

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/content" || path.startsWith("/content/")) {
      const relPath = path.slice("/content/".length);
      const filePath = join(CONTENT_DIR, relPath);
      const hasExt = !!extname(filePath);
      const target = hasExt ? filePath : filePath + ".md";

      if (req.method === "GET") {
        if (!existsSync(target)) return new Response(null, { status: 404 });
        const file = Bun.file(target);
        return new Response(file, {
          headers: {
            "Content-Type": hasExt && extname(target) === ".md" ? "text/markdown" : file.type,
          },
        });
      }

      if (req.method === "PUT") {
        const text = await req.text();
        mkdirSync(dirname(target), { recursive: true });
        await Bun.write(target, text);
        return new Response("ok");
      }

      if (req.method === "DELETE") {
        if (!existsSync(target)) return new Response(null, { status: 404 });
        rmSync(target, { force: true });
        let dir = dirname(target);
        while (dir.startsWith(CONTENT_DIR)) {
          const entries = readdirSync(dir);
          if (entries.length > 0) break;
          rmSync(dir, { force: true });
          dir = dirname(dir);
        }
        return new Response("ok");
      }

      return new Response(null, { status: 405 });
    }

    if (path === "/api/tree") {
      return new Response(JSON.stringify(buildTree(CONTENT_DIR)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/api/move" && req.method === "POST") {
      const { from, to } = await req.json();
      const src = join(CONTENT_DIR, from.replace(/^\//, ""));
      const dst = join(CONTENT_DIR, to.replace(/^\//, ""));

      if (!existsSync(src)) return new Response("Source not found", { status: 404 });
      if (existsSync(dst)) return new Response("Destination exists", { status: 409 });

      mkdirSync(dirname(dst), { recursive: true });
      const text = await Bun.file(src).text();
      await Bun.write(dst, text);
      rmSync(src, { force: true });

      let dir = dirname(src);
      while (dir.startsWith(CONTENT_DIR)) {
        const entries = readdirSync(dir);
        if (entries.length > 0) break;
        rmSync(dir, { force: true });
        dir = dirname(dir);
      }

      return new Response("ok");
    }

    const editorPath = join(EDITOR_DIR, path === "/" ? "index.html" : path);
    if (existsSync(editorPath)) {
      return new Response(Bun.file(editorPath));
    }

    return new Response(Bun.file(join(EDITOR_DIR, "index.html")));
  },
});

console.log(`sgtwiki serve → http://${HOST}:${PORT}`);

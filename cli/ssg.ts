import { $, which } from "bun";
import { join } from "path";
import { existsSync, statSync, rmSync } from "fs";
import {
  isWindows,
  platformOs,
  platformArch,
  exeName,
  askYesNo,
  downloadFile,
  extractTarGz,
  downloadAndExtractZip,
} from "./download/util";

const ROOT = join(import.meta.dir, "..");
const BIN_DIR = join(ROOT, "bin");
const THEMES_DIR = join(ROOT, "themes");
const BUILD_DIR = join(ROOT, "build");
const HUGO_VERSION = "0.158.0";

async function resolveHugo(): Promise<string> {
  const inPath = which("hugo");
  if (inPath) return inPath;

  const local = join(BIN_DIR, exeName("hugo"));
  if (existsSync(local)) return local;

  const url = `https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_${platformOs()}-${platformArch()}.tar.gz`;

  console.log(`\nHugo ${HUGO_VERSION} not found.` +
    `\n  Download: ${url}` +
    `\n  Extract "hugo" binary to: ${BIN_DIR}/` +
    `\n  Or place a hugo binary in your PATH or at ${local}\n`);

  if (!(await askYesNo("Download Hugo automatically?"))) {
    throw new Error("Hugo is required. Download it manually and re-run.");
  }

  console.log("Downloading Hugo...");
  const tmp = join(BIN_DIR, "hugo.tar.gz");
  await downloadFile(url, tmp);
  await extractTarGz(tmp, BIN_DIR, "hugo");
  rmSync(tmp, { force: true });

  if (isWindows()) {
    const hugoExe = join(BIN_DIR, "hugo.exe");
    const hugoBin = join(BIN_DIR, "hugo");
    if (existsSync(hugoBin) && !existsSync(hugoExe)) {
      await $`mv ${hugoBin} ${hugoExe}`.nothrow();
    }
  }

  if (!existsSync(local))
    throw new Error("Hugo download/extract failed");

  console.log(`Hugo ${HUGO_VERSION} ready at ${local}`);
  return local;
}

const THEME_SOURCES: Record<string, { url: string; strip: string }> = {
  book: {
    url: "https://github.com/alex-shpak/hugo-book/archive/refs/tags/v0.14.0.zip",
    strip: "hugo-book-0.14.0",
  },
};

async function resolveTheme(name: string): Promise<string> {
  const themeDir = join(THEMES_DIR, name);
  if (existsSync(themeDir)) return themeDir;

  const source = THEME_SOURCES[name];
  if (!source) {
    throw new Error(
      `Unknown theme "${name}". Available: ${Object.keys(THEME_SOURCES).join(", ")}`,
    );
  }

  console.log(`\nTheme "${name}" not found.` +
    `\n  Download: ${source.url}` +
    `\n  Extract to: ${themeDir}` +
    `\n  Or manually place the theme in ${THEMES_DIR}/${name}\n`);

  if (!(await askYesNo(`Download theme "${name}" automatically?`))) {
    throw new Error(`Theme "${name}" is required. Download it manually and re-run.`);
  }

  console.log(`Downloading theme "${name}"...`);
  return await downloadAndExtractZip(source.url, name, THEMES_DIR, source.strip);
}

export async function build() {
  console.log("sgtwiki build — generating static site...");
  const [hugo] = await Promise.all([resolveHugo(), resolveTheme("book")]);
  const baseURL = process.env.HUGO_BASEURL ?? "/";
  const result =
    await $`${hugo} --source ${ROOT} --theme book --baseURL ${baseURL} --destination ${BUILD_DIR}`.nothrow();
  if (result.exitCode !== 0) {
    console.error("Hugo build failed:", result.stderr.toString());
    process.exit(1);
  }
  console.log(`Static site written to ${BUILD_DIR}`);
}

export async function dev() {
  const [hugo] = await Promise.all([resolveHugo(), resolveTheme("book")]);
  const PORT = process.env.PORT || "5000";
  const BIND = process.env.HOST || "0.0.0.0";
  console.log(`Starting Hugo dev server with live reload on ${BIND}:${PORT}...`);
  const result = await $`${hugo} server --source ${ROOT} --port ${PORT} --bind ${BIND}`.nothrow();
  if (result.exitCode !== 0) {
    console.error("Hugo dev server failed:", result.stderr.toString());
    process.exit(1);
  }
}

export async function servePreview() {
  const PORT = parseInt(process.env.PORT || "5000");
  const HOST = process.env.HOST || "0.0.0.0";

  if (!existsSync(BUILD_DIR)) {
    console.error("Build directory not found. Run `sgtwiki build` first.");
    process.exit(1);
  }

  Bun.serve({
    port: PORT,
    hostname: HOST,
    fetch(req) {
      const url = new URL(req.url);
      let filePath = join(BUILD_DIR, url.pathname === "/" ? "index.html" : url.pathname);
      if (!existsSync(filePath)) {
        filePath = join(BUILD_DIR, "404.html");
      } else if (statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }
      if (!existsSync(filePath)) return new Response("Not Found", { status: 404 });
      return new Response(Bun.file(filePath));
    },
  });

  console.log(`ssg serve → http://${HOST}:${PORT}`);
}

import { $, which } from "bun";
import { join } from "path";
import { existsSync, rmSync } from "fs";
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
const HUGO_VERSION = "0.158.0";

async function resolveHugo(): Promise<string> {
  const inPath = which("hugo");
  if (inPath) return inPath;

  const local = join(BIN_DIR, exeName("hugo"));
  if (existsSync(local)) return local;

  const url = `https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_${platformOs()}-${platformArch()}.tar.gz`;

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

  if (!(await askYesNo(`Download theme "${name}" automatically?`))) {
    throw new Error(`Theme "${name}" is required. Download it manually and re-run.`);
  }

  console.log(`Downloading theme "${name}"...`);
  return await downloadAndExtractZip(source.url, name, THEMES_DIR, source.strip);
}

export async function fetchDeps() {
  console.log("sgtwiki fetch-deps — ensuring Hugo and theme are available...");
  const [hugo, theme] = await Promise.all([resolveHugo(), resolveTheme("book")]);
  console.log(`Hugo: ${hugo}`);
  console.log(`Theme: ${theme}`);
}

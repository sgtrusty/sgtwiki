import { join } from "path";
import { existsSync } from "fs";
import { askYesNo, downloadAndExtractZip } from "./download/util";

const ROOT = join(import.meta.dir, "..", "..");
const THEMES_DIR = join(ROOT, "themes");

const THEME_SOURCES: Record<string, { url: string; strip: string }> = {
  book: {
    url: "https://github.com/alex-shpak/hugo-book/archive/refs/tags/v0.14.0.zip",
    strip: "hugo-book-0.14.0",
  },
};

export async function resolveTheme(name: string): Promise<string> {
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
    throw new Error(
      `Theme "${name}" is required. Download it manually and re-run.`,
    );
  }

  console.log(`Downloading theme "${name}"...`);
  return await downloadAndExtractZip(
    source.url,
    name,
    THEMES_DIR,
    source.strip,
  );
}

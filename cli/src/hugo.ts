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
} from "./download/util";

const ROOT = join(import.meta.dir, "..", "..");
const BIN_DIR = join(ROOT, "bin");
const HUGO_VERSION = "0.158.0";

export async function resolveHugo(): Promise<string> {
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
    // tar extracts as "hugo" even on Windows; rename to .exe if needed
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

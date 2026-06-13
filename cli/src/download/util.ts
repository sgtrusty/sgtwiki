import { $ } from "bun";
import { join, dirname } from "path";
import { createInterface } from "readline";
import { isatty } from "tty";
import { existsSync, mkdirSync, renameSync, rmSync, readdirSync } from "fs";

export function isWindows(): boolean {
  return process.platform === "win32";
}

export function platformOs(): string {
  const map: Record<string, string> = {
    win32: "windows",
    darwin: "macOS",
    linux: "Linux",
  };
  return map[process.platform] || process.platform;
}

export function platformArch(): string {
  const map: Record<string, string> = {
    x64: "64bit",
    arm64: "ARM64",
  };
  return map[process.arch] || process.arch;
}

export function exeName(base: string): string {
  return isWindows() ? `${base}.exe` : base;
}

export async function askYesNo(question: string): Promise<boolean> {
  if (!isatty(process.stdin.fd)) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} [Y/n] `, (answer) => {
      rl.close();
      const v = answer.trim().toLowerCase();
      resolve(v === "" || v === "y" || v === "yes");
    });
  });
}

export async function downloadFile(url: string, dest: string): Promise<void> {
  mkdirSync(dirname(dest), { recursive: true });
  const resp = await fetch(url);
  if (!resp.ok)
    throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  await Bun.write(dest, resp);
}

export async function extractTarGz(
  archive: string,
  destDir: string,
  fileInArchive?: string,
): Promise<void> {
  mkdirSync(destDir, { recursive: true });
  const args = ["-xzf", archive, "-C", destDir];
  if (fileInArchive) args.push(fileInArchive);
  const { exitCode, stderr } = await $`tar ${args}`.nothrow();
  if (exitCode !== 0) throw new Error(`tar extraction failed: ${stderr}`);
}

export async function extractZip(
  archive: string,
  destDir: string,
): Promise<void> {
  mkdirSync(destDir, { recursive: true });
  if (isWindows()) {
    const { exitCode } =
      await $`powershell -Command "Expand-Archive -Path '${archive}' -DestinationPath '${destDir}' -Force"`
        .nothrow();
    if (exitCode !== 0) throw new Error("zip extraction via PowerShell failed");
  } else {
    const { exitCode, stderr } =
      await $`unzip -q ${archive} -d ${destDir}`.nothrow();
    if (exitCode !== 0) throw new Error(`unzip failed: ${stderr}`);
  }
}

export async function downloadAndExtractZip(
  url: string,
  name: string,
  parentDir: string,
  stripDir: string,
): Promise<string> {
  const targetDir = join(parentDir, name);
  const tmp = join(parentDir, `${name}.zip`);

  await downloadFile(url, tmp);
  await extractZip(tmp, parentDir);

  const extracted = join(parentDir, stripDir);
  if (existsSync(extracted)) {
    rmSync(targetDir, { recursive: true, force: true });
    renameSync(extracted, targetDir);
  }

  rmSync(tmp, { force: true });
  if (!existsSync(targetDir))
    throw new Error(`Failed to extract "${name}" theme`);

  return targetDir;
}

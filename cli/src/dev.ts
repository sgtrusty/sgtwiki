import { $ } from "bun";
import { join } from "path";
import { resolveHugo } from "./hugo";
import { resolveTheme } from "./theme";

const ROOT = join(import.meta.dir, "..", "..");

const [hugo] = await Promise.all([resolveHugo(), resolveTheme("book")]);

const PORT = process.env.PORT || "5000";
const BIND = process.env.HOST || "0.0.0.0";

console.log(`Starting Hugo dev server with live reload on ${BIND}:${PORT}...`);
const result =
  await $`${hugo} server --source ${ROOT} --port ${PORT} --bind ${BIND}`.nothrow();

if (result.exitCode !== 0) {
  console.error("Hugo dev server failed:", result.stderr.toString());
  process.exit(1);
}

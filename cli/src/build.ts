import { $ } from "bun";
import { join } from "path";
import { resolveHugo } from "./hugo";
import { resolveTheme } from "./theme";

const ROOT = join(import.meta.dir, "..", "..");
const DEST = join(ROOT, "build");

console.log("sgtwiki build — generating static site...");

const [hugo] = await Promise.all([resolveHugo(), resolveTheme("book")]);
const baseURL = process.env.HUGO_BASEURL ?? "/";
const result =
  await $`${hugo} --source ${ROOT} --theme book --baseURL ${baseURL} --destination ${DEST}`.nothrow();

if (result.exitCode !== 0) {
  console.error("Hugo build failed:", result.stderr.toString());
  process.exit(1);
}

console.log(`Static site written to ${DEST}`);

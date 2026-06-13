import { resolveHugo } from "./hugo";
import { resolveTheme } from "./theme";

console.log("sgtwiki fetch-deps — ensuring Hugo and theme are available...");

const [hugo, theme] = await Promise.all([resolveHugo(), resolveTheme("book")]);

console.log(`Hugo: ${hugo}`);
console.log(`Theme: ${theme}`);

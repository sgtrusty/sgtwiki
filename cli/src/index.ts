#!/usr/bin/env bun

const [cmd, ...args] = process.argv.slice(2)

switch (cmd) {
  case "serve":
    await import("./serve")
    break
  case "build":
    await import("./build")
    break
  case "serve-ssg":
    await import("./serve-ssg")
    break
  case "dev":
    await import("./dev")
    break
  case "fetch-deps":
    await import("./fetch-deps")
    break
  default:
    console.log(`Usage: sgtwiki {serve|build|serve-ssg|dev|fetch-deps}

  serve       Start the live editor server
  build       Build static site via Hugo
  serve-ssg   Serve the built static site from build/
  dev         Start Hugo dev server with live reload
  fetch-deps  Download Hugo and theme dependencies
`)
    process.exit(1)
}

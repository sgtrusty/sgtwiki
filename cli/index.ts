#!/usr/bin/env bun

const [cmd] = process.argv.slice(2)

switch (cmd) {
  case "serve":
    await import("./serve")
    break
  case "build":
  case "serve-ssg":
  case "dev": {
    const ssg = await import("./ssg")
    if (cmd === "build") await ssg.build()
    else if (cmd === "serve-ssg") await ssg.servePreview()
    else await ssg.dev()
    break
  }
  case "fetch-deps":
    const { fetchDeps } = await import("./fetch-deps")
    await fetchDeps()
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

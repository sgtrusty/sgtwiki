---
title: Roadmap
weight: 40
---

# Roadmap

## Filesystem Mounting

The content directory should be mountable as a volume or bind mount. The server would detect an existing populated `content/` at startup and use direct filesystem reads/writes. A fallback using the File System Access API (FSAA) could let the browser read/write local files with user permission in environments without a dedicated server.

## Git Integration

Future builds could auto-commit and push changes. Snapshot copies before each flush would provide undo history beyond the in-memory buffer.

## Compile Target

A single binary via `bun build --compile` would bundle the CLI, server, and editor into one portable executable with no runtime dependencies beyond Hugo.

## SSG Pipeline Enhancements

* Flush pending edits from browser buffer to disk before build

* Auto-generate or update `hugo.toml`

* Serve the built site with `--preview` flag after build

* Watch mode: rebuild on content changes

## Hosting

The `build/` output is a portable static site compatible with any static host — GitHub Pages, Surge, Netlify, Vercel, or plain S3.

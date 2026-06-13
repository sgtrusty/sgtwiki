---
title: Architecture
weight: 10
---

# Architecture

sgtwiki operates in two modes that share a single `content/` directory of plain markdown files.

## Two Modes

**Editor** — A local Bun HTTP server serves the filesystem as a live wiki. Edit pages via WYSIWYG (Milkdown) or raw markdown. Changes write directly to `.md` files — the filesystem is the source of truth.

**SSG** — Runs Hugo with the [Book theme](https://github.com/alex-shpak/hugo-book) to produce a static site into `build/`. Deploy anywhere: GitHub Pages, Surge, Netlify, etc.

## Why Plain Markdown

No database, no lock-in. The directory tree is the page hierarchy. `docs/advanced/config.md` → `/docs/advanced/config`. Stop using the app and you keep your docs.

## Auto-Resolved Dependencies

Both Hugo and the Book theme are downloaded automatically on first build via `cli/src/download/util.ts`. No manual install. On non-interactive terminals (CI) the download proceeds automatically; in a terminal you get a Y/n prompt with manual download instructions.

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | [Bun](https://bun.sh) | Single-binary compile target, TS-native, fast |
| Editor | [Milkdown](https://milkdown.dev) v7 | ProseMirror + Remark, WYSIWYG and MD source, TS-native, no HTML↔MD roundtrip |
| Navigation | [Hotwired](https://hotwired.dev) (Turbo + Stimulus) | HTML-over-wire, progressive enhancement, ~28KB gzip combined |
| SSG | [Hugo](https://gohugo.io) + [Book theme](https://github.com/alex-shpak/hugo-book) | Fastest SSG, mature ecosystem, clean docs output |
| Content | Plain `.md` | Portable, version-controllable, zero lock-in |

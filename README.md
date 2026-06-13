# sgtwiki

A markdown wiki with live WYSIWYG editing and static site export via Hugo Book.

## Quick Start

```bash
bun install

# Live editor with inline markdown editing
bun run editor:dev

# Build static site
bun run ssg:build

# Serve the static site locally
bun run ssg:serve

# Hugo dev server with live reload
bun run ssg:dev
```

Hugo and the Book theme are downloaded automatically on first build — no manual setup needed.

## How it Works

Two layers that share the same `content/` directory:

**Editor (`editor:dev`)** — A local server with a WYSIWYG editor (Milkdown + ProseMirror) and raw markdown mode. The filesystem is the source of truth: directories map to the page tree, edits write directly to `.md` files.

**SSG (`ssg:build`)** — Runs Hugo with the Book theme to generate a static site into `build/`. Deploy anywhere (GitHub Pages, Surge, Netlify, etc.).

## Tech Stack

| Layer | |
|---|---|
| Runtime | Bun |
| Editor | Milkdown, Hotwired (Stimulus + Turbo) |
| SSG | Hugo + Book theme |
| Content | Plain `.md` files — zero lock-in |

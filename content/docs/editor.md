---
title: Editor
weight: 20
---

# Editor

The editor is a local Bun HTTP server that serves a live WYSIWYG editing interface on top of the `content/` directory.

## Milkdown

[Milkdown](https://milkdown.dev) (v7, 11k+ stars) is the core editor. It's built on ProseMirror + Remark and works with markdown natively — no HTML→MD→HTML roundtrip. Both WYSIWYG and raw markdown source modes are available.

## Hotwired (Turbo + Stimulus)

Navigation and interaction use [Hotwired](https://hotwired.dev):

* **Turbo Drive** — SPA-like navigation without client-side routing

* **Turbo Frames** — Inline editing without hand-coded fetch calls

* **Stimulus** — Tiny controllers for editor mount/unmount, mode toggle, save buffer, flush

Combined bundle: **~28KB gzip**. [Datastar](https://data-star.dev) (~12KB) was evaluated as a lighter alternative if real-time SSE collaboration becomes a requirement later.

## Flush-Based Writes

Edits accumulate in an in-memory buffer + IndexedDB (crash recovery). The filesystem is only touched on explicit "Flush" — not on every keystroke. This prevents partial writes and reduces I/O.

## Bundle Size

| Package | Size (gzip) |
|---|---|
| `@hotwired/turbo` | ~23KB |
| `@hotwired/stimulus` | ~10KB |
| `@milkdown/kit` | varies by preset |

Stimulus-only mode (~10KB) is possible if Turbo Drive/Frames aren't needed.

## Future: Filesystem Mounting

The content directory can be a mounted/bind volume. The server checks for an existing `content/` directory at startup. A future File System Access API (FSAA) fallback would let the browser read/write local files with user permission.

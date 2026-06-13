---
title: Getting Started
weight: 1
---

# Getting Started

## Prerequisites

* [Bun](https://bun.sh) >= 1.2 (runtime)

Hugo and the Book theme are downloaded automatically on first build.

## Quick Start

```bash
git clone <repo> sgtwiki && cd sgtwiki
bun install

# Live editor
bun run editor:dev

# Build static site
bun run ssg:build

# Preview the static site
bun run ssg:serve

# Hugo dev server with live reload
bun run ssg:dev
```

See the [Architecture](/docs/architecture) page for an overview of how the two modes work together.

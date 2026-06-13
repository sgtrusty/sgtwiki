---
title: Static Site Generator
weight: 30
---

# Static Site Generator

The SSG layer converts markdown content into a fully static HTML site using [Hugo](https://gohugo.io) and the [Book theme](https://github.com/alex-shpak/hugo-book) by Alex Shpak.

## Why Hugo

Hugo is the most popular static site generator — mature, fast (sub-second builds), and distributed as a single binary. No runtime dependencies.

## Why Book Theme

The [Hugo Book theme](https://themes.gohugo.io/themes/hugo-book/) (~4k stars, MIT license) is built for documentation:

* Clean, minimal, mobile-friendly design

* Works without JavaScript

* Dark mode, search, multi-language support

* Useful shortcodes: hints, tabs, expand/collapse, mermaid diagrams

## Build Pipeline

```
bun run ssg:build     # Generate build/
bun run ssg:serve     # Preview locally
bun run ssg:dev       # Hugo server with live reload
```

The build command:

1. Resolves Hugo (auto-downloads if missing)
2. Resolves the Book theme (auto-downloads if missing)
3. Runs `hugo --source . --theme book --destination build`
4. Outputs a portable static site to `build/`

## Credits

* [Hugo](https://gohugo.io) by Bjørn Erik Pedersen and contributors

* [Book theme](https://github.com/alex-shpak/hugo-book) by Alex Shpak (MIT)

* [Hugo Book on Hugo Themes](https://themes.gohugo.io/themes/hugo-book/)

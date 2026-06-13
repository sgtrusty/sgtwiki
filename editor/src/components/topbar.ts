import { html, render } from "lit-html"
import { colors } from "../theme"
import type { Editor } from "@milkdown/kit/core"
import { editorViewCtx } from "@milkdown/kit/core"
import { toggleMark } from "prosemirror-commands"

export interface TopbarAPI {
  updateCounter(count: number, totalBytes: number): void
  setDirtyState(hasDirty: boolean): void
}

export function mountTopbar(
  container: HTMLElement,
  getEditor: () => Editor | null,
  callbacks: {
    onPrefs: () => void
    onDirtyClick?: () => void
  }
): TopbarAPI {
  const counterId = "dirty-counter-" + Math.random().toString(36).slice(2)
  const flushId = "flush-btn-" + Math.random().toString(36).slice(2)

  const exec = (cmd: string) => {
    const milkdown = getEditor()
    if (!milkdown) return
    milkdown.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const { state, dispatch } = view
      const { schema } = state
      switch (cmd) {
        case "bold":
          toggleMark(schema.marks.strong)(state, dispatch)
          break
        case "italic":
          toggleMark(schema.marks.em)(state, dispatch)
          break
        case "strike":
          toggleMark(schema.marks.strikethrough)(state, dispatch)
          break
        case "code":
          toggleMark(schema.marks.code)(state, dispatch)
          break
        case "link": {
          const url = prompt("URL:")
          if (url) toggleMark(schema.marks.link, { href: url })(state, dispatch)
          break
        }
      }
    })
  }

  const tmpl = html`
    <div class="editor-toolbar" @click=${(e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest(".dirty-counter")?.classList.contains("clickable")) {
        callbacks.onDirtyClick?.()
      }
    }}>
      <button @click=${() => exec("bold")}><b>B</b></button>
      <button @click=${() => exec("italic")}><i>I</i></button>
      <button @click=${() => exec("strike")}><s>S</s></button>
      <button @click=${() => exec("code")}>code</button>
      <button @click=${() => exec("link")}>link</button>
      <button data-action="editor#toggleSource"></> Source</button>
      <div class="spacer"></div>
      <span class="dirty-counter" id="${counterId}"></span>
      <button id="${flushId}" class="flush-btn" data-action="editor#flush" disabled>Flush</button>
      <button @click=${callbacks.onPrefs} title="Preferences">&#9881;</button>
    </div>
  `

  render(tmpl, container)

  const toolbar = container.querySelector(".editor-toolbar")
  if (toolbar && container.parentElement) {
    container.parentElement.insertBefore(toolbar, container.parentElement.firstChild)
  }

  return {
    updateCounter(count: number, totalBytes: number) {
      const el = document.getElementById(counterId)
      if (!el) return
      if (count === 0) {
        el.textContent = ""
        el.classList.toggle("clickable", false)
        return
      }
      const sign = totalBytes >= 0 ? "+" : "-"
      const abs = Math.abs(totalBytes)
      const size = abs < 1024
        ? `${sign}${abs} B`
        : `${sign}${(abs / 1024).toFixed(1)} KB`
      el.innerHTML = `${count} unsaved file${count > 1 ? "s" : ""} <span style="color:${totalBytes > 0 ? colors.green : totalBytes < 0 ? colors.danger : 'inherit'}">${size}</span>`
      el.classList.toggle("clickable", true)
    },
    setDirtyState(hasDirty: boolean) {
      const flush = document.getElementById(flushId)
      if (flush) flush.disabled = !hasDirty
    },
  }
}
import { html } from "lit-html"

export type ButtonVariant = "primary" | "danger" | "default"

export const overlayStyles = `
#sgtwiki-dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
`

export const windowStyles = `
.sgtwiki-window {
  background: #fff; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; max-height: 80vh;
  min-width: 420px; max-width: 560px;
}
.sgtwiki-window-header {
  padding: 1rem 1.5rem 0; font-size: 1.1rem; font-weight: 600; flex-shrink: 0;
}
.sgtwiki-window-body {
  padding: 0.5rem 1.5rem; overflow-y: auto; flex: 1;
}
.sgtwiki-window-actions {
  display: flex; gap: 0.5rem; justify-content: flex-end;
  padding: 0.75rem 1.5rem 1rem; flex-shrink: 0;
}
`

export const buttonStyles = `
.sgtwiki-btn {
  padding: 0.4rem 1.2rem; border-radius: 4px; cursor: pointer;
  font-size: 0.9rem; border: 1px solid #d8dee9; background: #fff;
  color: #4c566a; transition: background 0.15s, border-color 0.15s;
}
.sgtwiki-btn:hover { background: #e5e9f0; }
.sgtwiki-btn.sgtwiki-btn-primary {
  background: #5e81ac; color: #fff; border-color: #5e81ac;
}
.sgtwiki-btn.sgtwiki-btn-primary:hover { background: #4a7098; }
.sgtwiki-btn.sgtwiki-btn-danger {
  background: #bf616a; color: #fff; border-color: #bf616a;
}
.sgtwiki-btn.sgtwiki-btn-danger:hover { background: #a9444e; }
`

export function miniWindow(title: string, body: unknown, actions: unknown) {
  return html`
    <style>${overlayStyles}${windowStyles}${buttonStyles}</style>
    <div class="sgtwiki-window" @click=${(e: MouseEvent) => e.stopPropagation()}>
      <div class="sgtwiki-window-header">${title}</div>
      <div class="sgtwiki-window-body">${body}</div>
      <div class="sgtwiki-window-actions">${actions}</div>
    </div>
  `
}

export interface ButtonOpts {
  label: string
  variant?: ButtonVariant
  disabled?: boolean
}

export function actionBtn(opts: ButtonOpts) {
  const cls = ["sgtwiki-btn"]
  if (opts.variant === "primary") cls.push("sgtwiki-btn-primary")
  if (opts.variant === "danger") cls.push("sgtwiki-btn-danger")
  return html`<button class=${cls.join(" ")} ?disabled=${opts.disabled ?? false}>${opts.label}</button>`
}

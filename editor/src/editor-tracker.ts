import type { MetaPanelData } from "./components/meta-panel"
import { saveStorage, type WikiStorage } from "./storage"

export interface EditorTracker {
  buffer: Map<string, string>
  dirtyFiles: Set<string>
  frontmatterCache: Map<string, MetaPanelData>
  syncStorage(): void
  getBuffer(path: string): string | undefined
  setBuffer(path: string, content: string): void
  deleteBuffer(path: string): void
  addDirty(path: string): void
  removeDirty(path: string): void
  setFrontmatter(path: string, data: MetaPanelData): void
  removeFrontmatter(path: string): void
  hasDirty(path: string): boolean
}

export function createTracker(initial?: WikiStorage): EditorTracker {
  const buffer = new Map<string, string>(initial?.buffer || [])
  const dirtyFiles = new Set<string>(initial?.dirtyFiles || [])
  const frontmatterCache = new Map<string, MetaPanelData>(
    initial?.frontmatterCache?.map(([k, v]) => [k, v as MetaPanelData]) || []
  )

  function syncStorage() {
    saveStorage({
      buffer: [...buffer.entries()],
      dirtyFiles: [...dirtyFiles],
      frontmatterCache: [...frontmatterCache.entries()],
    })
  }

  return {
    buffer,
    dirtyFiles,
    frontmatterCache,
    syncStorage,
    getBuffer: (path) => buffer.get(path),
    setBuffer: (path, content) => buffer.set(path, content),
    deleteBuffer: (path) => buffer.delete(path),
    addDirty: (path) => dirtyFiles.add(path),
    removeDirty: (path) => dirtyFiles.delete(path),
    setFrontmatter: (path, data) => frontmatterCache.set(path, data),
    removeFrontmatter: (path) => frontmatterCache.delete(path),
    hasDirty: (path) => dirtyFiles.has(path),
  }
}
/**
 * Manages mounting/unmounting Vue component instances inside GridStack widget cells.
 * GridStack owns the DOM; we inject Vue apps into each cell's content div.
 */
import { createApp, type App, type Component, type ComponentPublicInstance } from 'vue'

interface MountedWidget {
  app: App
  el: HTMLElement
}

export function useGridStackWidgets() {
  const mounted = new Map<string, MountedWidget>()

  function mountWidget(
    targetEl: HTMLElement,
    component: Component,
    props: Record<string, unknown>,
  ) {
    const id = targetEl.id || targetEl.getAttribute('data-widget-id') || String(Math.random())

    // Unmount previous instance at this element if any
    unmountWidget(id)

    const app = createApp(component, props)
    app.mount(targetEl)
    mounted.set(id, { app, el: targetEl })
    return app
  }

  function unmountWidget(id: string) {
    const existing = mounted.get(id)
    if (existing) {
      existing.app.unmount()
      mounted.delete(id)
    }
  }

  function unmountAll() {
    mounted.forEach(({ app }) => app.unmount())
    mounted.clear()
  }

  return { mountWidget, unmountWidget, unmountAll }
}

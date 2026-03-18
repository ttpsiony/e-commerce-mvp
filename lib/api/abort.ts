export type AbortManager = {
  cancel: (key: string, reason?: string) => boolean
  cancelAll: (reason?: string) => void
  has: (key: string) => boolean
  keys: () => string[]
  set: (key: string) => AbortController
  delete: (key: string) => boolean
}

const abortControllers = new Map<string, AbortController>()
const abortManager: AbortManager = {
  cancel(key: string, reason = 'Request canceled by client') {
    const controller = abortControllers.get(key)
    if (!controller) return false

    controller.abort(reason)
    abortControllers.delete(key)
    return true
  },
  cancelAll(reason = 'All requests canceled by client') {
    for (const [key, controller] of abortControllers.entries()) {
      controller.abort(reason)
      abortControllers.delete(key)
    }
  },
  has(key: string) {
    return abortControllers.has(key)
  },
  keys() {
    return [...abortControllers.keys()]
  },
  set(key: string) {
    const controller = new AbortController()
    abortControllers.set(key, controller)
    return controller
  },
  delete(key: string) {
    if (!abortControllers.has(key)) return false
    abortControllers.delete(key)
    return true
  }
}

export { abortManager }

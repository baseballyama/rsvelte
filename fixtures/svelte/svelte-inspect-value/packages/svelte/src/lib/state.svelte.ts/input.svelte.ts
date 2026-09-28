/* eslint-disable @typescript-eslint/no-unused-vars */
import { getContext } from 'svelte'
import { ensureStringPath } from './util.js'

export const STATE_CONTEXT_KEY = Symbol('inspect-state')

/** @inline */
export type NodeState = {
  collapsed: boolean
}

/** @inline */
export type CollapseState = Record<string, NodeState>

export function createState(init: CollapseState, onChange?: (value: CollapseState) => void) {
  function emitChanged() {
    onChange?.($state.snapshot(init))
  }

  return {
    get value(): CollapseState {
      return init
    },
    set value(val: CollapseState) {
      init = val
    },
    setCollapse: (keyOrPath: string | PropertyKey[], newValues: NodeState) => {
      try {
        const key = ensureStringPath(keyOrPath)
        let changed = false
        if (init) {
          const existing = init[key] ?? {}
          init[key] = { ...existing, ...newValues }
          changed = true
        }
        if (changed && init) {
          emitChanged()
        }
      } catch (e) {
        console.error(e)
      }
    },
    setCollapseStartsWith: (keyOrPath: string | PropertyKey[], newValues: NodeState) => {
      try {
        const key = ensureStringPath(keyOrPath)
        let changed = false
        if (init) {
          Object.entries(init).forEach(([k]) => {
            if (k.startsWith(key) || k === key) {
              init[key] = { ...init[key], ...newValues }
              changed = true
            } else {
              init[key] = newValues
            }
          })
        }
        if (changed && init) {
          emitChanged()
        }
      } catch (e) {
        console.error(e)
      }
    },
    setCollapseWhere: (test: (path: string) => boolean, newValues: NodeState) => {
      try {
        if (init) {
          Object.entries(init).forEach(([p]) => {
            if (test(p)) {
              init[p] = { ...init[p], ...newValues }
            }
          })
        }
      } catch {
        //
      }
    },
    getCollapse(keyOrPath: string | PropertyKey[]) {
      const key = ensureStringPath(keyOrPath)
      return init?.[key]
    },
    collapseChildren: (level: number, path: PropertyKey[]) => {
      if (init) {
        let changed = false
        Object.entries(init).forEach((entry) => {
          const [key] = entry
          if (key.split('.').length > level) {
            entry[1].collapsed = true
            changed = true
          }
        })
        if (changed) {
          emitChanged()
        }
      }
    },
    expandChildren: (currentLevel: number, currentPath: string | PropertyKey[]) => {
      if (init) {
        let changed = false

        const key = ensureStringPath(currentPath)
        init[key].collapsed = false
        Object.entries(init).forEach((entry) => {
          const [k] = entry
          const stringPath = k.split('.')
          if (k.startsWith(key) && stringPath.length === currentLevel + 1) {
            entry[1].collapsed = false
            changed = true
          }
        })

        if (changed) {
          emitChanged()
        }
      }
    },
  }
}

export type StateContext = ReturnType<typeof createState>

export function useState(): StateContext {
  return getContext<StateContext>(STATE_CONTEXT_KEY)
}

import { DEV } from 'esm-env'
import { onDestroy } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import type { Note } from './types.js'

type GlobalValue = {
  note?: Note
  value: unknown
}

export const globalValues = new SvelteMap<PropertyKey, GlobalValue>()

const _componentNameRegex = /(\+)?\w+\.svelte/gm
const componentNameWithPathRegex = /([()A-z$_-]+\/)+(\+)?(\w+[^Tools])\.svelte(?!\.ts)/gm

/**
 * Remove a registered "global" value
 */
export function removeFromPanel(name: PropertyKey) {
  globalValues.delete(name)
}

/**
 * @experimental
 *
 * Register a "global" value to be inspected with `Inspect.Panel`.
 * It is recommended to call this during component initialization.
 *
 * Returns a function that removes the added value when called.
 *
 * If called during component initialization, the value will automatically be removed when the component is unmounted.
 *
 * If called after component initialization (i.e. on click) the returned remove-function should be called when the component is destroyed.
 * If not, value will lose reactivity and may cause weird side-effects or throw errors.
 *
 * Can also safely be run inside an `$effect` that will re-add the value if removed and it changes.
 *
 * @example
 * ```svelte
 * <script>
 *  import {onDestroy} from 'svelte'
 *  import Inspect, {addToPanel} from 'svelte-inspect-value'
 *
 *  let value = $state('test')
 *  let anObject = $state({})
 *  let anotherValue = $state(123)
 *
 *  // call during initialization
 *  // will be removed when this component is destroyed.
 *  addToPanel('a', () => value)
 *
 *  $effect(() => {
 *    // re-set the value if it changes
 *    // will be removed when this component is destroyed.
 *    addToPanel('b', () => anObject)
 *  })
 *
 *  let remove;
 *  function add() {
 *    // called after initialization. value will not be removed
 *    remove = addToPanel('b', () => anotherValue)
 *  }
 *
 *  onDestroy(() => {
 *    if(remove) remove?.()
 *  })
 * </script>
 *
 * <button onclick={add}>add</button>
 *
 * ```
 *
 * @param name Display name of inspected value
 * @param val Function returning value to be inspected
 * @param addedBy (Optional) label of where value was added from
 * @returns Function that removes added value when called. Returns `true` if value was removed, `false` if value didn't exist
 */
export function addToPanel(name: PropertyKey, val: () => unknown, addedBy?: string) {
  let addedByPath: string | undefined
  if (DEV && addedBy == null) {
    const err = new Error()
    if (err.stack) {
      const path = err.stack.match(componentNameWithPathRegex)?.[0]
      addedByPath = path ? `Added from ${path}` : undefined
      addedBy = path ? path.split('/').at(-1) : addedBy
    }
  }

  const note: Note | undefined = addedBy ? { title: addedBy, description: addedByPath } : undefined
  const entry = {
    note,
    get value() {
      return val()
    },
  }

  const remove = () => {
    globalValues.delete(name)
  }

  try {
    $effect(() => {
      val()
      globalValues.set(name, entry)
    })
    onDestroy(remove)
  } catch {
    // lifecycle_outside_component error
    // return manual remove fn
    globalValues.set(name, entry)
    return remove
  }

  return remove
}

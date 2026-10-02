import { BROWSER } from 'esm-env'
import { on } from 'svelte/events'
import { createSubscriber } from 'svelte/reactivity'
const defaultWindow = BROWSER && typeof window !== 'undefined' ? window : undefined

/**
 * @inline
 */
type Serializer<T> = {
  serialize: (value: T) => string
  deserialize: (value: string) => T | undefined
}

/**
 * @inline
 */
type StorageType = 'local' | 'session'

function getStorage(storageType: StorageType, window: Window & typeof globalThis): Storage {
  switch (storageType) {
    case 'local':
      return window.localStorage
    case 'session':
      return window.sessionStorage
  }
}

export type PersistedStateOptions<T = unknown> = {
  /**
   * Storage key used with local/session storage
   *
   * @default 'siv.panel'
   */
  key?: string
  /**
   * The storage type to use.
   * @default 'local'
   */
  storage?: StorageType
  /** The serializer to use. Defaults to `JSON.stringify` and `JSON.parse`. */
  serializer?: Serializer<T>
  /**
   * Enable or disable syncing the state changes from other tabs.
   * @default false
   */
  syncTabs?: boolean
}

function proxy<T>(
  value: unknown,
  root: T | undefined,
  proxies: WeakMap<WeakKey, unknown>,
  subscribe: VoidFunction | undefined,
  update: VoidFunction | undefined,
  serialize: (root?: T | undefined) => void
): T {
  if (value === null || typeof value !== 'object') {
    return value as T
  }
  const proto = Object.getPrototypeOf(value)
  if (proto !== null && proto !== Object.prototype && !Array.isArray(value)) {
    return value as T
  }
  let p = proxies.get(value)
  if (!p) {
    p = new Proxy(value, {
      get: (target, property) => {
        subscribe?.()
        return proxy(Reflect.get(target, property), root, proxies, subscribe, update, serialize)
      },
      set: (target, property, value) => {
        update?.()
        Reflect.set(target, property, value)
        serialize(root)
        return true
      },
    })
    proxies.set(value, p)
  }
  return p as T
}

/**
 * Borrowed from {@link https://runed.dev/docs/utilities/persisted-state runed} persisted state with slight modifications.
 */
export class PersistedState<T> {
  #current: T | undefined
  #key: string
  #serializer: Serializer<T>
  #storage?: Storage
  #subscribe?: VoidFunction
  #update: VoidFunction | undefined
  #proxies = new WeakMap()

  constructor(initialValue: T, options: PersistedStateOptions<T> = {}) {
    const {
      key = 'siv.panel',
      storage: storageType = 'local',
      serializer = { serialize: JSON.stringify, deserialize: JSON.parse },
      syncTabs = false,
    } = options
    const window = defaultWindow // window is not mockable to be undefined without this, because JavaScript will fill undefined with `= default`

    this.#current = initialValue
    this.#key = key
    this.#serializer = serializer

    if (window === undefined) return

    const storage = getStorage(storageType, window)
    this.#storage = storage

    const existingValue = storage.getItem(key)
    if (existingValue !== null) {
      this.#current = this.#deserialize(existingValue)
    } else {
      this.#serialize(initialValue)
    }

    if (syncTabs && storageType === 'local') {
      this.#subscribe = createSubscriber((update) => {
        this.#update = update
        const cleanup = on(window, 'storage', this.#handleStorageEvent)
        return () => {
          cleanup()
          this.#update = undefined
        }
      })
    } else {
      this.#subscribe = createSubscriber((update) => {
        this.#update = update
      })
    }
  }

  get current(): T {
    this.#subscribe?.()

    const storageItem = this.#storage?.getItem(this.#key)
    const root = storageItem ? this.#deserialize(storageItem) : this.#current
    return proxy(
      root,
      root,
      this.#proxies,
      this.#subscribe?.bind(this),
      this.#update?.bind(this),
      this.#serialize.bind(this)
    )
  }

  set current(newValue: T) {
    this.#serialize(newValue)
    this.#update?.()
  }

  #handleStorageEvent = (event: StorageEvent): void => {
    if (event.key !== this.#key || event.newValue === null) return
    this.#current = this.#deserialize(event.newValue)
    this.#update?.()
  }

  #deserialize(value: string): T | undefined {
    try {
      return this.#serializer.deserialize(value)
    } catch (error) {
      console.error(`Error when parsing "${value}" from persisted store "${this.#key}"`, error)
      return
    }
  }

  #serialize(value: T | undefined): void {
    try {
      if (value != undefined) {
        this.#storage?.setItem(this.#key, this.#serializer.serialize(value))
      }
    } catch (error) {
      console.error(
        `Error when writing value from persisted store "${this.#key}" to ${this.#storage}`,
        error
      )
    }
  }
}

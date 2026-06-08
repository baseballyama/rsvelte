import { defaultWindow } from "../../internal/configurable-globals.js";
import { on } from "svelte/events";
import { createSubscriber } from "svelte/reactivity";
function getStorage(storageType, window) {
    switch (storageType) {
        case "local":
            return window.localStorage;
        case "session":
            return window.sessionStorage;
    }
}
function proxy(value, root, proxies, subscribe, update, serialize) {
    if (value === null || typeof value !== "object") {
        return value;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto !== null && proto !== Object.prototype && !Array.isArray(value)) {
        return value;
    }
    let p = proxies.get(value);
    if (!p) {
        p = new Proxy(value, {
            get: (target, property) => {
                subscribe?.();
                return proxy(Reflect.get(target, property), root, proxies, subscribe, update, serialize);
            },
            set: (target, property, value) => {
                update?.();
                Reflect.set(target, property, value);
                serialize(root);
                return true;
            },
        });
        proxies.set(value, p);
    }
    return p;
}
/**
 * Creates reactive state that is persisted and synchronized across browser sessions and tabs using Web Storage.
 * @param key The unique key used to store the state in the storage.
 * @param initialValue The initial value of the state if not already present in the storage.
 * @param options Configuration options including storage type, serializer for complex data types, and whether to sync state changes across tabs.
 *
 * @see {@link https://runed.dev/docs/utilities/persisted-state}
 */
export class PersistedState {
    #current;
    #key;
    #serializer;
    #storage;
    #subscribe;
    #update;
    #proxies = new WeakMap();
    #connected;
    #storageCleanup;
    #window;
    #syncTabs;
    #storageType;
    constructor(key, initialValue, options = {}) {
        const { storage: storageType = "local", serializer = { serialize: JSON.stringify, deserialize: JSON.parse }, syncTabs = true, connected = true, } = options;
        const window = "window" in options ? options.window : defaultWindow; // window is not mockable to be undefined without this, because JavaScript will fill undefined with `= default`
        this.#current = initialValue;
        this.#key = key;
        this.#serializer = serializer;
        this.#connected = connected;
        this.#window = window;
        this.#syncTabs = syncTabs;
        this.#storageType = storageType;
        if (window === undefined)
            return;
        const storage = getStorage(storageType, window);
        this.#storage = storage;
        const existingValue = storage.getItem(key);
        if (existingValue !== null) {
            this.#current = this.#deserialize(existingValue);
        }
        else if (connected) {
            this.#serialize(initialValue);
        }
        this.#setupStorageListener();
    }
    get current() {
        this.#subscribe?.();
        let root;
        if (this.#connected) {
            // when we're connected to storage, we use storage as the source of truth
            const storageItem = this.#storage?.getItem(this.#key);
            root = storageItem ? this.#deserialize(storageItem) : this.#current;
        }
        else {
            // when we're not connected to storage, we use the current value in memory
            root = this.#current;
        }
        return proxy(root, root, this.#proxies, this.#subscribe?.bind(this), this.#update?.bind(this), this.#serialize.bind(this));
    }
    set current(newValue) {
        this.#serialize(newValue);
        this.#update?.();
    }
    #handleStorageEvent = (event) => {
        if (event.key !== this.#key || event.newValue === null)
            return;
        this.#current = this.#deserialize(event.newValue);
        this.#update?.();
    };
    #deserialize(value) {
        try {
            return this.#serializer.deserialize(value);
        }
        catch (error) {
            console.error(`Error when parsing "${value}" from persisted store "${this.#key}"`, error);
            return;
        }
    }
    #serialize(value) {
        if (!this.#connected) {
            // when we're not connected to storage, we only update the value in memory
            this.#current = value;
            return;
        }
        try {
            if (value !== undefined) {
                this.#storage?.setItem(this.#key, this.#serializer.serialize(value));
            }
        }
        catch (error) {
            console.error(`Error when writing value from persisted store "${this.#key}" to ${this.#storage}`, error);
        }
    }
    #setupStorageListener() {
        if (!this.#window || !this.#connected)
            return;
        this.#subscribe = createSubscriber((update) => {
            this.#update = update;
            this.#storageCleanup =
                this.#connected && this.#syncTabs && this.#storageType === "local"
                    ? on(this.#window, "storage", this.#handleStorageEvent)
                    : undefined;
            return () => {
                this.#storageCleanup?.();
                this.#storageCleanup = undefined;
                this.#update = undefined;
            };
        });
    }
    #teardownStorageListener() {
        this.#storageCleanup?.();
        this.#storageCleanup = undefined;
        this.#subscribe = undefined;
    }
    /**
     * Returns whether the state is currently connected to storage.
     *
     * When `connected` is `false`, the state is not connected to storage and any
     * changes to the state will not be persisted to storage and any changes to storage
     * will not be reflected in the state.
     */
    get connected() {
        return this.#connected;
    }
    /**
     * Disconnects the state from storage, preventing updates to storage and stopping
     * cross-tab synchronization. The current value in storage is removed.
     *
     * Call `.connect()` to re-enable storage persistence.
     */
    disconnect() {
        if (!this.#connected)
            return;
        // capture current value from storage before removing
        const storageItem = this.#storage?.getItem(this.#key);
        if (storageItem) {
            this.#current = this.#deserialize(storageItem);
        }
        this.#connected = false;
        this.#storage?.removeItem(this.#key);
        this.#teardownStorageListener();
    }
    /**
     * Reconnects the state to storage, enabling storage persistence and cross-tab
     * synchronization. The current value is immediately persisted to storage.
     *
     * **NOTE**: By default, the state is already connected to storage and this method is
     * only useful to re-enable storage persistence after calling `disconnect()`
     * or starting with `connected: false` as an option.
     */
    connect() {
        if (this.#connected)
            return;
        this.#connected = true;
        this.#serialize(this.#current);
        this.#setupStorageListener();
    }
}

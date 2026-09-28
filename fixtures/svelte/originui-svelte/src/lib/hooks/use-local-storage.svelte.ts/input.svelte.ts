import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';

export class LocalStorage<T extends object> {
	#key: string;
	#value: T | undefined;
	#update: (() => void) | undefined;
	#subscribe = createSubscriber((update) => {
		this.#update = update;
		return on(window, 'storage', (e) => {
			if (e.storageArea !== localStorage) return;
			if (e.key !== this.#key) return;
			update();
		});
	});

	constructor(key: string, initial?: T) {
		this.#key = key;
		this.#value = initial;

		if (typeof localStorage !== 'undefined') {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(initial));
			}
		}
	}

	get current(): T {
		this.#subscribe();

		const root =
			typeof localStorage !== 'undefined'
				? (JSON.parse(localStorage.getItem(this.#key)!) as T)
				: (this.#value as T);

		const proxies = new WeakMap<object, T>();

		const proxy = (value: T | unknown): T | unknown => {
			if (typeof value !== 'object' || value === null) {
				return value;
			}

			let p = proxies.get(value as object);

			if (!p) {
				p = new Proxy(value as T, {
					get: (target, property) => {
						this.#subscribe();
						return proxy(Reflect.get(target, property));
					},
					set: (target, property, value) => {
						Reflect.set(target, property, value);

						if (typeof localStorage !== 'undefined') {
							localStorage.setItem(this.#key, JSON.stringify(root));
						}

						this.#update?.();
						return true;
					}
				}) as T;

				proxies.set(value as object, p);
			}

			return p;
		};

		return proxy(root) as T;
	}

	set current(value: T) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(this.#key, JSON.stringify(value));
		}
		this.#update?.();
	}
}

export function useLocalStorage<T extends object>(key: string, initial?: T) {
	return new LocalStorage<T>(key, initial);
}

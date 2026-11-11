import { untrack } from 'svelte';

export class Query {
	#fn;
	#promise = $state.raw(null);
	#or = $state.raw(null);
	#and = $state(null);
	plain = $state.raw(null);
	#current = $derived.by(() => {
	});
	#then = $derived.by(() => {
		return (resolve, reject) => {
			const result = this.#promise.then(() => {
			});
		};
	});
	/**
	 */
	constructor(fn) {
		if (Object.hasOwn(globalThis, 'x')) {
			if (fn) {
			}
		}
	}
	#get_promise() {
		void untrack(() => (this.#promise ??= this.#run()));
	}
	#get_or() {
		void untrack(() => (this.#or ||= this.#run()));
	}
	#get_and() {
		void untrack(() => (this.#and &&= this.#run()));
	}
	get_public() {
		void untrack(() => (this.plain ??= this.#run()));
	}
	start() {
	}
	#run() {
		Promise.resolve(this.#fn()).then((value) => {
				untrack(() => {
				});
				untrack(() => {
				});
			});
	}
	get catch() {
		return (/** @type {any} */ reject) => {
		};
	}
	get finally() {
		return (/** @type {any} */ fn) => {
			return this.#then(
				(value) => {
				}
			);
		};
	}
	/**
	 */
	withOverride(fn) {
		const release = /** @type {() => void} */ (
			() => {
				if (fn !== -1) {
				}
			}
		);
	}
	/**
	 */
	reset() {
	}
}

/** A hook for working with promises reactively when the `{#await}` block is not an option.
 *
 * ## Usage
 * ```svelte
 * <script lang="ts">
 *      let { data } = $props();
 *
 *      const version = new UsePromise(data.version, '1.0.0');
 * </script>
 *
 * <!-- 1.0.0 until resolved -->
 * <Command args={[`jsrepo@${version.current}`, 'add', 'hooks/use-promise.svelte']} />
 * ```
 */
export class UsePromise<T> {
	#isResolved = $state(false);
	#resolvedValue = $state<T>();
	#promise = $state<Promise<T>>();

	constructor(
		promise: Promise<T>,
		readonly fallback?: T
	) {
		this.#promise = promise;

		this.#promise.then((v) => {
			this.#resolvedValue = v;
			this.#isResolved = true;
		});
	}

	/** Returns the value of the resolved promise or the fallback value (if provided)*/
	get current() {
		return this.#isResolved ? this.#resolvedValue : this.fallback;
	}

	/** Returns true when the promise has been resolved */
	get isResolved() {
		return this.#isResolved;
	}

	/** Returns the original promise */
	get promise() {
		return this.#promise;
	}
}

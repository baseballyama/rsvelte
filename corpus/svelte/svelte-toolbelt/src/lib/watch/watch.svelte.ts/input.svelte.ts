import { untrack } from "svelte";
import type { Box } from "$lib/types.js";

type WatcherCallback<T> = (
	curr: T,
	prev: T
) => void | Promise<void> | (() => void) | (() => Promise<void>);

type WatchOptions = {
	/**
	 * Whether to eagerly run the watcher before the state is updated.
	 */
	immediate?: boolean;

	/**
	 * Whether to run the watcher only once.
	 */
	once?: boolean;
};

export function watch<T>(box: Box<T>, callback: WatcherCallback<T>, options: WatchOptions = {}) {
	let prev = $state(box.current);
	let ranOnce = false;

	const watchEffect = $effect.root(() => {
		$effect.pre(() => {
			if (prev === box.current || !options.immediate) return;
			if (options.once && ranOnce) return;
			callback(
				box.current,
				untrack(() => prev)
			);
			untrack(() => (prev = box.current));
			ranOnce = true;
		});

		$effect(() => {
			if (prev === box.current || options.immediate) return;
			if (options.once && ranOnce) return;

			callback(
				box.current,
				untrack(() => prev)
			);
			untrack(() => (prev = box.current));
			ranOnce = true;
		});
	});
	return watchEffect;
}

import { untrack } from "svelte";

export function onMountEffect(fn: () => void) {
	$effect(() => {
		const cleanup = untrack(() => fn());
		return cleanup;
	});
}

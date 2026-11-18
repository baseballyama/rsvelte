<script lang="ts">
	import { writable, readable } from 'svelte/store';

	// A TS `this` parameter occupies params[0] in the ESTree.
	const a = writable(0, function (this: Window, set: (v: number) => void) {
		set(1);
	});
	const b = readable(0, function (this: Window, notSet: (v: number) => void) {
		notSet(1);
	});
	const c = writable(0, (set?: (v: number) => void) => {
		set?.(1);
	});
</script>

<p>{a}{b}{c}</p>

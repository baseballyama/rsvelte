<script lang="ts">
	import { readable, writable } from 'svelte/store';

	type Sub = (set: (v: number) => void) => void;

	const a = writable<number>(0, async (set) => {
		set(1);
	});
	const b = readable(0, (async (set) => {
		set(2);
	}) as Sub);
</script>

<p>{$a} {$b}</p>

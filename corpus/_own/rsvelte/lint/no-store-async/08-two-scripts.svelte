<script module>
	import { readable } from 'svelte/store';

	export const shared = readable(0, async (set) => set(1));
</script>

<script>
	import { writable } from 'svelte/store';

	const local = writable(0, async (set) => set(2));
</script>

<p>{$shared} {$local}</p>

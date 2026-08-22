<script>
	import { writable } from 'svelte/store';

	const a = writable(0, async (set) => set(1));
</script>

<p>{$a}</p>

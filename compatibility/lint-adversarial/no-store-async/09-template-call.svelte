<script>
	import { readable } from 'svelte/store';

	const base = readable(0, (set) => set(1));
</script>

<p>{$base}</p>
<p>{readable(0, async (set) => set(2))}</p>

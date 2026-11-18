<script>
	import { writable } from 'svelte/store';

	const makeWritable = writable;
	const s = makeWritable(0, async (set) => set(1));
</script>

<p>{$s}</p>

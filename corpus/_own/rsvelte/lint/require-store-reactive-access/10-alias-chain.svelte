<script>
	import { writable } from 'svelte/store';

	const make = writable;
	const s = make(0);
</script>

<p>{s}</p>

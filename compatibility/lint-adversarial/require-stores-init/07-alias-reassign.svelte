<script>
	import { writable } from 'svelte/store';

	const make = writable;
	const s = make();
</script>

<p>{$s}</p>

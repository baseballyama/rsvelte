<script>
	import { writable } from 'svelte/store';

	const store = writable(0);
	store.subscribe(() => {});
</script>

<p>{$store}</p>

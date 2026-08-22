<script>
	import { writable } from 'svelte/store';

	const store = writable(0);
	const keep = store.subscribe((v) => v);
	// store.subscribe(() => {});
	const s = 'store.subscribe(() => {})';
	store.subscribe((v) => console.log(v, s, keep));
</script>

<p>{$store}</p>

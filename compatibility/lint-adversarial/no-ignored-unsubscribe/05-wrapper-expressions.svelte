<script>
	import { writable } from 'svelte/store';

	const store = writable(0);
	(store.subscribe(() => {}));
	store.subscribe(() => {}), void 0;
	void store.subscribe(() => {});
	const un = store.subscribe(() => {});
	un();
</script>

<p>{$store}</p>

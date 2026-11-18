<script lang="ts">
	import { writable, type Unsubscriber } from 'svelte/store';

	const store = writable(0);
	store!.subscribe(() => {});
	(store as { subscribe(fn: () => void): Unsubscriber }).subscribe(() => {});
	store.subscribe(() => {})!;
</script>

<p>{$store}</p>

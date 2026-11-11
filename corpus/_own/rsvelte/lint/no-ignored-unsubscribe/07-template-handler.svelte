<script>
	import { writable } from 'svelte/store';

	const store = writable(0);
</script>

<button
	on:click={() => {
		store.subscribe(() => {});
	}}>go</button>

<p>{$store}</p>

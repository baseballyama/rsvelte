<script>
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	const store = writable(0);
	onMount(() => {
		store.subscribe(() => {});
	});
	onMount(() => store.subscribe(() => {}));
	function setup() {
		store.subscribe(() => {});
		return true;
	}
	setup();
</script>

<p>{$store}</p>

<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div>{$store.x}</div>
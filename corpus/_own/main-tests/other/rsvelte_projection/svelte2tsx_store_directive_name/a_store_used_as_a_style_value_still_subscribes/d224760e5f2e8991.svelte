<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div style:color={$store}>x</div>
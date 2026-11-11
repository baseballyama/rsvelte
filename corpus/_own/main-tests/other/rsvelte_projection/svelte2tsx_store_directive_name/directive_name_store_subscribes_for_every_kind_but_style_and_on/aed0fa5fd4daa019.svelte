<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div on:$store>x</div>
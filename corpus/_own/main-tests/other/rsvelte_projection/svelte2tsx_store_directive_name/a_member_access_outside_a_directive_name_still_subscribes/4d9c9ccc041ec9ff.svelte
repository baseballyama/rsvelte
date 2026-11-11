<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div use:x={$store.action}>x</div>
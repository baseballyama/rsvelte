<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div class:$store.action>x</div>
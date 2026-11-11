<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div in:$store.action>x</div>
<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div transition:$store.action>x</div>
<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div out:$store.action>x</div>
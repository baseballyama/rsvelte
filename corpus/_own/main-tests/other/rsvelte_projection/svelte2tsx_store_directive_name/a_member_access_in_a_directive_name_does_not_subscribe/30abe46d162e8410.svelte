<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<div use:$store.a.b>x</div>
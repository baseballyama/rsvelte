<script>
	import { writable } from 'svelte/store';

	const store = writable('v');
</script>

<div style:$store>x</div>

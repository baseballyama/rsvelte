<script>
	import { writable } from 'svelte/store';

	const store = writable(() => {});
</script>

<div use:$store>x</div>

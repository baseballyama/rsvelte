<script>
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	const store = writable(fade);
</script>

<div transition:$store>x</div>

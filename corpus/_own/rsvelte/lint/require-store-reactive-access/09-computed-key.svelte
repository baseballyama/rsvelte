<script>
	import { writable } from 'svelte/store';

	const s = writable('k');
</script>

<p>{JSON.stringify({ [s]: 1 })}</p>
<p>{JSON.stringify({ [ s ]: 2 })}</p>

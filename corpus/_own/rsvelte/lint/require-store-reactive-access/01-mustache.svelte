<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
</script>

<p>{count}</p>
<p>{$count}</p>

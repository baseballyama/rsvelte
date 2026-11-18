<script>
	import { readable } from 'svelte/store';

	const a = readable(0, (tick) => tick(1));
</script>

<p>{$a}</p>

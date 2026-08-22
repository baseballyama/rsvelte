<script>
	import { writable } from 'svelte/store';

	const init = writable(0);
</script>

<p>{writable()}</p>
<p>{$init}</p>

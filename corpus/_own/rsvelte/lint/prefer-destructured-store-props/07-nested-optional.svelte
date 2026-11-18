<script>
	import { writable } from 'svelte/store';

	const a = writable({ b: { c: 1 } });
</script>

<p>{$a.b.c}</p>
<p>{$a?.b}</p>

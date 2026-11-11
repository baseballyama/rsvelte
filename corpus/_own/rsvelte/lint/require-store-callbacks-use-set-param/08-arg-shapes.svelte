<script>
	import { writable, readable } from 'svelte/store';

	const starter = (x) => x;
	const a = writable(0);
	const b = readable(1, starter);
	const c = writable(...[0, (z) => z]);
</script>

<p>{$a} {$b} {$c}</p>

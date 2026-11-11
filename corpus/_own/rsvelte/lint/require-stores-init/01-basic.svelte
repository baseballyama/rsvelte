<script>
	import { writable, readable, derived } from 'svelte/store';

	const a = writable();
	const b = writable(undefined);
	const c = readable();
	const d = derived(b, ($b) => $b);
	const e = derived(b, ($b) => $b, null);
</script>

<p>{$a} {$b} {$c} {$d} {$e}</p>

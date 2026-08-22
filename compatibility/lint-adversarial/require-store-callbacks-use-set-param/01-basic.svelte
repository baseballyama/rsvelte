<script>
	import { writable, readable, derived } from 'svelte/store';

	const a = writable(0, (set) => {
		set(1);
	});
	const b = writable(0, (update) => {
		update(1);
	});
	const c = readable(0, () => {});
	const d = derived(a, ($a) => $a);
</script>

<p>{$a} {$b} {$c} {$d}</p>

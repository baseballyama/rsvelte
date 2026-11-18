<script>
	import { writable, readable, derived } from 'svelte/store';

	async function starter(set) {
		set(1);
	}
	const a = writable(async () => {});
	const b = writable(0, starter);
	const c = derived(a, async ($a) => $a, 0);
	const d = readable(0, async function start(set) {
		set(2);
	});
</script>

<p>{$a} {$b} {$c} {$d}</p>

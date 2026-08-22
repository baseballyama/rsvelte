<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d = derived(a, ($a, set) => {
		set($a);
	});
</script>

{$d}

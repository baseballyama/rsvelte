<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d = derived(a, ($a) => $a * 2);
</script>

{$d}

<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d1 = derived(a, (b = 0) => b);
	const d2 = derived(a, ({ v }) => v);
</script>

{$d1}{$d2}

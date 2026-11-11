<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d = derived(a, (b) => b * 2);
</script>

{$d}

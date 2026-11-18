<script>
	import { writable, derived as der } from 'svelte/store';
	const a = writable(0);
	const d = der(a, (x) => x + 1);
</script>

{$d}

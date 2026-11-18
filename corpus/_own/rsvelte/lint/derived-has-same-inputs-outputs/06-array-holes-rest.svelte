<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(1);
	const c = writable(3);
	const d1 = derived([a, , c], ([$a, , x]) => $a + x);
	const d2 = derived([a], ([...rest]) => rest.length);
</script>

{$d1}{$d2}

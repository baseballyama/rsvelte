<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(1);
	const b = writable(2);
	const d = derived([a, b], ([$a, $bb]) => $a + $bb);
</script>

{$d}

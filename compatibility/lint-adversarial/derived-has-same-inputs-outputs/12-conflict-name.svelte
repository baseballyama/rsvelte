<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d = derived(a, (b) => {
		const $a = 1;
		return b + $a;
	});
</script>

{$d}

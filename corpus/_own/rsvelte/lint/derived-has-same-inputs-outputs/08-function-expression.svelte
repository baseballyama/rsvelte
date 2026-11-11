<script>
	import { writable, derived } from 'svelte/store';
	const a = writable(0);
	const d = derived(a, function (inner) {
		return inner;
	});
</script>

{$d}

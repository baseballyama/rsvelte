<script>
	import * as store from 'svelte/store';
	const a = store.writable(0);
	const d = store.derived(a, (v) => v + 1);
</script>

{$d}

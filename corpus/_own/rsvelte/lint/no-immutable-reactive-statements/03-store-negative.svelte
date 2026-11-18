<script>
	import { writable } from 'svelte/store';
	const s = writable(0);
	$: v = $s + 1;
</script>

{v}

<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	$: $s.a = 1;
</script>

{$s.a}

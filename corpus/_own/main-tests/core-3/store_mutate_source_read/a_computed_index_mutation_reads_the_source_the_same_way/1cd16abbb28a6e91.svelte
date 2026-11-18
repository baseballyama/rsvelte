<script>
	import { writable } from 'svelte/store';
	let s = writable([]);
	s = writable([1]);
	$: $s[0] = 1;
</script>

{$s.a}

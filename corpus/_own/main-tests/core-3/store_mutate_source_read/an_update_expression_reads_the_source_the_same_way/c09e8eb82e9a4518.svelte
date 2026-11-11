<script>
	import { writable } from 'svelte/store';
	let s = writable({ a: 0 });
	s = writable({ a: 1 });
	$: $s.a++;
</script>

{$s.a}

<script>
	import { writable } from 'svelte/store';
	let s = writable({});
	s = writable({ b: 1 });
	$: $s.a = 1;
</script>

{$s.a}

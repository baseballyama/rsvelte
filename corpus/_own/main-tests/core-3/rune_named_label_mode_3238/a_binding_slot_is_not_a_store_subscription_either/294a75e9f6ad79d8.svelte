<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	let n = 0;
	function f() { try { n = 1; } catch ($count) { n = $count; } }
</script>

<div>{n} {f}</div>

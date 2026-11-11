<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	let n = 0;
	function f() { try { n = 1; } catch ($count) { n = 2; } }
</script>

<div>{$count} {n} {f}</div>

<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	let n = 0;
	function f() { $count: for (;;) { break $count; } }
</script>

<div>{n} {f}</div>

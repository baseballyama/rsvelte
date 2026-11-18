<script>
	import { writable } from 'svelte/store';
	const s1 = writable(0);
	let rest = {};
	const obj = { s1: 1, c: 2 };
	function f() { ({ s1: $s1, ...rest } = obj); }
</script>
<button onclick={f}>{$s1} {JSON.stringify(rest)}</button>
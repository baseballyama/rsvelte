<script lang="ts">
	import Imp from './Imp.svelte';
	let { p = 1, q } = $props();
	let a = 1;
	let s = $state(0);
	let r = $state.raw(0);
	let d = $derived(s * 2);
	let l = 0;
	const c = 3;
	function f() { a = 0; s = 1; r = 2; l = 2; p = 3; q = 4; K = class {}; }
	let K = class {};
	type T = number;
	export { a, a as b, s, r, d, l as lll, c as "c-d", f, K, Imp, p, q, type T };
	export type { T as U };
	export const z = 1;
</script>
<p>{s} {l} {a}</p>

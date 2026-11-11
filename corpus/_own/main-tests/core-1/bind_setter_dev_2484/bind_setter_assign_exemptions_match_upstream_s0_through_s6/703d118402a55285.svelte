<script>
	import Comp from './Comp.svelte';
	let s = $state({ x: {}, y: {} });
	let d = $state({ e: {} });
	let o = $state({ k: 1 });
	let flag = $state(true);
	function wrap(f) { return f; }
</script>

<input bind:value={() => s.x, wrap((v) => (s.y = o))} />

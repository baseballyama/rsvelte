<script>
	import Comp from './Comp.svelte';
	let scroll = $state({ x: 0, y: 0 });
	let other = $state({ d: 0 });
	let obj = $state({});
	function wrap(f) { return f; }
</script>
<input bind:value={() => scroll.x, (v) => (scroll.y = obj, other.d = obj)} />

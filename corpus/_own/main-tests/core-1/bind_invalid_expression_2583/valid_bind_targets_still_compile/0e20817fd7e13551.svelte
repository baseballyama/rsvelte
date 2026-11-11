<script>
	import Comp from './Comp.svelte';
	let o = $state({});
	let obj = {};
</script>
<Comp bind:this={o.x} />
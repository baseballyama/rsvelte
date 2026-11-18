<script>
	import Comp from './Comp.svelte';
	let o = $state({});
	let obj = {};
</script>
<Comp bind:value={() => o.x, (v) => (o.x = v)} />
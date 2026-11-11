<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<svelte:body bind:value={v} />
<p>{v}</p>
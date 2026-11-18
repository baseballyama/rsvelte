<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<svelte:element this="div" bind:value={v} {...rest} />
<p>{v}</p>
<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<svelte:document {...rest} on:click={f} />
<p>{v}</p>
<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<svelte:document bind:value={v} {...rest} />
<p>{v}</p>
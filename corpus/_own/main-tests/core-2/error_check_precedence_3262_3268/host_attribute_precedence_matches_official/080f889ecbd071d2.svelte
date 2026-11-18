<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<div {...rest} bind:value={v} />
<p>{v}</p>
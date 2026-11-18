<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<Comp title="t" bind:value={v} />
<p>{v}</p>
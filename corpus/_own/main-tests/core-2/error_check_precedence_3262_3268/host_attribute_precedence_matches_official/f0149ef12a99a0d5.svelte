<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<Comp bind:value={v} title="t" />
<p>{v}</p>
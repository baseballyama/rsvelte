<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<input bind:value={v} title="t" />
<p>{v}</p>
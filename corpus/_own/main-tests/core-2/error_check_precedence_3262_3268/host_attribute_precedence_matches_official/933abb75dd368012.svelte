<script>
	import Comp from './Comp.svelte';
	let rest = {};
	let v = 1;
	const f = () => {};
</script>
<input {...rest} on:click={f} />
<p>{v}</p>
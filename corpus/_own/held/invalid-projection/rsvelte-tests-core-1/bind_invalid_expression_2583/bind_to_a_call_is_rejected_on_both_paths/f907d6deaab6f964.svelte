<script>
	import Comp from './Comp.svelte';
	let o = $state({});
	let obj = {};
</script>
<input bind:value={o.f()} />
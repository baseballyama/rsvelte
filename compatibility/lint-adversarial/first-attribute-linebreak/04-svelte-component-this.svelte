<script>
	import Comp from './Comp.svelte';
</script>

<svelte:component this={Comp}
	prop="a" />

<svelte:component
	this={Comp} prop="a" />

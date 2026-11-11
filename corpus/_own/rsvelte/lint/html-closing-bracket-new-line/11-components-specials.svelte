<script>
	import Comp from './Comp.svelte';
	let p = 1;
</script>

<Comp
	prop={p}
	other="x" />

<svelte:window
	on:resize={() => p++} />

<svelte:component this={Comp} prop={p}
/>

<slot name="s"
></slot>

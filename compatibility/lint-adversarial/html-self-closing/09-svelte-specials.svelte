<script>
	import Comp from './Comp.svelte';
	let n = 0;
</script>

<svelte:head></svelte:head>
<svelte:window on:keydown={() => n++} />
<svelte:body on:click={() => n++}></svelte:body>
<Comp>
	<svelte:fragment slot="s"></svelte:fragment>
</Comp>

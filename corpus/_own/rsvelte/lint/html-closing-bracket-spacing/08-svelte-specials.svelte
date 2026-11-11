<script>
	import Comp from './Comp.svelte';
	let n = 0;
</script>

<svelte:window on:resize={() => n++}/>
<svelte:body on:click={() => n++} />
<svelte:head><meta name="a" content="b" ></svelte:head>
<svelte:component this={Comp}/>
<Comp prop={n} >child</Comp >

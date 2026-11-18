<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
</script>

<slot class="slotclass" />
<Foo class="compclass" />
<svelte:element this={tag} class="dynclass" />
<svelte:head><meta name="x" class="headclass" /></svelte:head>
<svelte:fragment><b class="fragclass">a</b></svelte:fragment>

<style>
	.used {
		color: red;
	}
</style>

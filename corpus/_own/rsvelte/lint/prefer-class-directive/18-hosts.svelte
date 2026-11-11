<script>
	import Foo from './Foo.svelte';
	let c = true;
	let tag = 'div';
</script>

<Foo class="{c ? 'a' : ''}" />
<slot class="{c ? 'a' : ''}" />
<svelte:element this={tag} class="{c ? 'a' : ''}" />
<svelte:element this="div" class="{c ? 'a' : ''}" />
<svelte:head><meta name="x" class="{c ? 'a' : ''}" /></svelte:head>

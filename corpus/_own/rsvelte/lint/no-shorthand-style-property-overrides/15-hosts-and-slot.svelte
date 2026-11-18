<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
</script>

<slot style="margin-top: 1px; margin: 0" />
<Foo style="margin-top: 1px; margin: 0" />
<svelte:element this={tag} style="margin-top: 1px; margin: 0" />
<svelte:head><meta name="x" style="margin-top: 1px; margin: 0" /></svelte:head>

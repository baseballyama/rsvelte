<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
</script>

<slot style="color: red; color: blue" />
<Foo style="color: red; color: blue" />
<svelte:element this={tag} style="color: red; color: blue" />
<svelte:head><meta name="x" style="color: red; color: blue" /></svelte:head>
<svelte:body style="color: red; color: blue" />

<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
	let x = 'color';
</script>

<Foo style="/* c */ color: red" />
<Foo style="{x}: red" />
<svelte:element this={tag} style="/* c */ color: red" />
<slot style="/* c */ color: red" />
<svelte:head><meta name="x" style="/* c */ color: red" /></svelte:head>

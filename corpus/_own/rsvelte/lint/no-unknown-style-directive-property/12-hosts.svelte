<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
</script>

<Foo style:bogus="1" />
<svelte:element this={tag} style:bogus="1" />
<slot style:bogus="1" />
<svelte:head><meta name="x" style:bogus="1" /></svelte:head>
<div><span style:bogus="1">a</span></div>

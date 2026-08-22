<script>
	import Foo from './Foo.svelte';
	let tag = 'div';
</script>

<Foo style="color: red" />
<svelte:element this={tag} style="color: red">a</svelte:element>
<svelte:element this="div" style="color: red">b</svelte:element>
<slot style="color: red" />
<div style="color: red"><span style="margin: 0">c</span></div>

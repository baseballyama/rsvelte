<script>
	import Comp from './Comp.svelte';
	let tag = 'div';
</script>

<svelte:component this = {Comp} />
<svelte:element this ={tag}>spaced this</svelte:element>

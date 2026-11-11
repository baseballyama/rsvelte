<script>
	import C from './01-basic.svelte';
	let b = 2;
</script>

<C attr={`v${b}`} />
<svelte:element this="div" data-x={`v${b}`}>1</svelte:element>

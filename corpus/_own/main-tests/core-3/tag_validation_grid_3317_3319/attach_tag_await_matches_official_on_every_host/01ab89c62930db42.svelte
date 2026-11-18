<script>
	import Child from './Child.svelte';
	let att = $state(() => {});
	let n = $state(1);
	let o = $state({ f: () => {} });
</script>
<svelte:element this={'div'} {@attach await Promise.resolve(att)}></svelte:element>

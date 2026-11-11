<script>
	import Child from './Child.svelte';
	let att = $state(() => {});
	let n = $state(1);
	let o = $state({ f: () => {} });
</script>
<svelte:head><div {@attach await Promise.resolve(att)}></div></svelte:head>

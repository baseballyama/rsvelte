<script>
	import Child from './Child.svelte';
	let att = $state(() => {});
	let n = $state(1);
	let o = $state({ f: () => {} });
</script>
{#each [1] as i}<div {@attach await Promise.resolve(att)}></div>{/each}

<script>
	import Child from './Child.svelte';
	let att = $state(() => {});
	let n = $state(1);
	let o = $state({ f: () => {} });
</script>
<input {@attach await Promise.resolve(att)} />

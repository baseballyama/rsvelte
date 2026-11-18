<script>
	import Child from './Child.svelte';
	let att = $state(() => {});
	let n = $state(1);
	let o = $state({ f: () => {} });
</script>
<Child><svelte:fragment slot="s" {@attach await Promise.resolve(att)}>y</svelte:fragment></Child>

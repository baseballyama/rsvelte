<script>
	import Child from './Child.svelte';
	function act(node) {}
	let p = Promise.resolve(act);
	let flag = true;
</script>
<Child><svelte:fragment slot="s" transition:act={await p}></svelte:fragment></Child>
<script>
	import Child from './Child.svelte';
	function act(node) {}
	let p = Promise.resolve(act);
	let flag = true;
</script>
<svelte:document animate:act={await p} />
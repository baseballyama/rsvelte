<script>
	import Child from './Child.svelte';
	function act(node) {}
	let p = Promise.resolve(act);
	let flag = true;
</script>
<svelte:element this={'div'} transition:act={await p}></svelte:element>
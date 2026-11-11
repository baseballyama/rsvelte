<script>
	import Child from './Child.svelte';
	function act(node) {}
	let p = Promise.resolve(act);
	let flag = true;
</script>
<div animate:act={await p}></div>
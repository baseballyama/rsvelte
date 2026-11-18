<script>
	import Child from './Child.svelte';
	let s = $state(1);
	let n = $state(1);
	let arr = $state([]);
	let o = $state({ k: 1 });
	let p = Promise.resolve(1);
</script>
<Child><svelte:fragment slot="s">{@debug s, n}</svelte:fragment></Child>

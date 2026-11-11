<script>
	import Child from './Child.svelte';
	let s = $state(1);
	let n = $state(1);
	let arr = $state([]);
	let o = $state({ k: 1 });
	let p = Promise.resolve(1);
</script>
{#await p then v}{@debug , s}{/await}

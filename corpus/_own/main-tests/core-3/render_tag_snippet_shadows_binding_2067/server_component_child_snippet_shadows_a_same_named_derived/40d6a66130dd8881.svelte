<script>
	import Child from './Child.svelte';
	let base = $state(1);
	let row = $derived(base + 1);
</script>
<Child>{#snippet row()}<b>local</b>{/snippet}{@render row()}</Child>
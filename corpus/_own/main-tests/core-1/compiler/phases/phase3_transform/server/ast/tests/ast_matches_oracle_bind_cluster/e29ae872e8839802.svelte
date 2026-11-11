<script>
	import Child from './Child.svelte';
	let child = $state();
</script>

<Child bind:this={() => child, v => child = v} />

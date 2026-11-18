<script>
	import Child from './Child.svelte';
	export let field = {};
</script>
<Child bind:value={field.name} />

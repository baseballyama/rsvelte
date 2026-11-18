<script>
	import Child from './Child.svelte';
	let { 'data-field': field = $bindable({}) } = $props();
</script>
<Child bind:value={field.name} />

<script>
	import Child from './Child.svelte';

	export let items;
</script>

<Child list={items.filter(Boolean)} />

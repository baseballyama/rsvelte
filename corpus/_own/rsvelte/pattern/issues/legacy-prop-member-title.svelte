<script>
	export let data;
</script>

<svelte:head>
	<title>
		{data.item && data.item.name ? `${data.item.name}` : 'Item'}
	</title>
</svelte:head>

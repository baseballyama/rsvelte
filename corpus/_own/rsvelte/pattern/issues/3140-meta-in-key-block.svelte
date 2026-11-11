<script>
	let n = $state(1);
</script>

{#key n}
	<svelte:head>
		<title>{n}</title>
	</svelte:head>
{/key}

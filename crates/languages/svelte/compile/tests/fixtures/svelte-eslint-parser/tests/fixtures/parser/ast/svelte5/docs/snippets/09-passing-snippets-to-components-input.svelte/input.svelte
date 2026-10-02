<script>
	let { data, children, row } = $props();
</script>

<table>
	{#if children}
		<thead>
			<tr>{@render children()}</tr>
		</thead>
	{/if}

	<!-- ... -->
</table>

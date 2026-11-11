<script>
	let open = $state(false);
</script>

<div>
	{#if open}
		<span>a</span>
		<!-- a -->
		<!-- b -->
		<span>b</span>
	{/if}
</div>

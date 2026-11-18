<script>
	const cond = true;
</script>
{#if cond}
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src="in-block.png" />
{/if}
<!-- svelte-ignore a11y_missing_attribute -->
{#if cond}
	<img src="under-if.png" />
{/if}

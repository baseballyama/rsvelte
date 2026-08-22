<script>
	export let a;
</script>

{#snippet block()}
	{#if a}
		<p>1</p>
	{:else if a}
		<p>2</p>
	{/if}
{/snippet}

{@render block()}

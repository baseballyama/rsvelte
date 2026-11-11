<script>
	export let data;
</script>

{#snippet row(x)}
	<p>{x}</p>
{/snippet}

{@render row(data)}

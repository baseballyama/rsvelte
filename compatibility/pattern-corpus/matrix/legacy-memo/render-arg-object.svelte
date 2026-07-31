<script>
	export let data;
</script>

{#snippet row(x)}
	<p>{x.id}</p>
{/snippet}

{@render row({ id: data.id })}

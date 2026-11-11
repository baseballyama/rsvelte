<script>
	export let data;

	function upper(value) {
		return value.toUpperCase();
	}
</script>

{#snippet row(x)}
	<p>{x}</p>
{/snippet}

{@render row(upper(data))}

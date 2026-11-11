<script>
	export let data;

	function log(d) {
		return d;
	}
</script>

{#snippet row(x)}
	<p>{x}</p>
{/snippet}

{@render row(log(data))}

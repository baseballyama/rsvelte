<script>
	export let data;

	function upper(value) {
		return value.toUpperCase();
	}
</script>

{#snippet row(id, name)}
	<p>{id}{name}</p>
{/snippet}

{@render row(`#${data.id}`, upper(data.name))}

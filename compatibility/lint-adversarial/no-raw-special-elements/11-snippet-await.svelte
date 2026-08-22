<script>
	let p = Promise.resolve(1);
</script>

{#snippet body()}
	<head></head>
{/snippet}
{@render body()}
{#await p}
	<window />
{:then v}
	<document>{v}</document>
{:catch e}
	<options>{e}</options>
{/await}

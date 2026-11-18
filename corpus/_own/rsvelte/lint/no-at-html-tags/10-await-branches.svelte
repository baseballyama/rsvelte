<script>
	let p = Promise.resolve('<i>a</i>');
	let fallback = '<em>l</em>';
</script>

{#await p}
	{@html fallback}
{:then value}
	{@html value}
{:catch err}
	{@html err.message}
{/await}

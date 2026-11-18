<script>
	const obj = { a: 1 };
</script>
{#each [obj.a + /}/.source] as n}<span>{n}</span>{/each}

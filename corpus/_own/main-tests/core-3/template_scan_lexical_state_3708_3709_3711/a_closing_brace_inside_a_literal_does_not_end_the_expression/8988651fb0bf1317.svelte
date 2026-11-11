<script>
	const obj = { a: 1 };
</script>
{#each [1] as n (obj.a + /\}/.source)}<span>{n}</span>{/each}

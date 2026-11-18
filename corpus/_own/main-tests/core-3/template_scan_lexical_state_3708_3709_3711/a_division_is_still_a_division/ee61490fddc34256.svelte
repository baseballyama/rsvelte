<script>
	const obj = { a: 1 };
</script>
{#each [(() => { let z = 1; z++; return z / 2; })()] as n}<span>{n}</span>{/each}

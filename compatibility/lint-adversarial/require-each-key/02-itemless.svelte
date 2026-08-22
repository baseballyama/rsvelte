<script>
	const n = 3;
</script>

{#each { length: n }}
	<span>row</span>
{/each}
{#each [1, 2]}
	<hr />
{/each}

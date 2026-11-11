<script>
	let count = $state(3);
</script>

{#each { length: count }}
	<hr />
{/each}

{#each Array(count), i}
	<span>{i}</span>
{/each}

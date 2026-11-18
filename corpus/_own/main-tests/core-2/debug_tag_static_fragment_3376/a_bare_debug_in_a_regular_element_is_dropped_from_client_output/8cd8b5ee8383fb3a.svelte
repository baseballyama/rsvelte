<script>
	let items = $state([1]);
	let flag = $state(true);
	let str = $state('x');
</script>
{#each items as it}<div>{@debug}</div>{/each}
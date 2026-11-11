<script>
	let items = $state([1]);
	let flag = $state(true);
	let str = $state('x');
</script>
{#if flag}<div>{@debug}</div>{/if}
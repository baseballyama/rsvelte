<script>
	let flag = $state(true);
	let rows = $state([1]);
</script>

{#snippet body(n)}
	<b>{n}</b>
{/snippet}

{@render body(1) // c
}

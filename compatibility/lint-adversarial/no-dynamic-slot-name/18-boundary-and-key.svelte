<script>
	let d = 'x';
	let k = 1;
</script>

<svelte:boundary>
	<slot name={d} />
</svelte:boundary>
{#key k}
	<slot name={d} />
{/key}

<script>
	export let n = 1;
	$: doubled = n * 2;
</script>

{#if doubled}
	{@const half = doubled / 2}
	<span>{half}</span>
{/if}

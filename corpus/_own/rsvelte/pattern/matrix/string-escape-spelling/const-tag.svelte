<script>
	let n = $state(0);
</script>

{#if true}
	{@const t = 'a\tb'}
	<p>{t}{n}</p>
{/if}

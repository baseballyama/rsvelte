<script module>
	const mp = Promise.resolve(1);
</script>
{#snippet outer()}{#await mp then v}{v}{/await}{/snippet}
{@render outer()}

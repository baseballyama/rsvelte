<script>
	const obj = { a: 1 };
</script>
{#if true}{@const [x] = [obj]}<span>ok</span>{/if}

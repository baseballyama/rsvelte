<script>
	const obj = { a: 1 };
</script>
{#await Promise.resolve('}')}p{:then v}<span>{v}</span>{/await}

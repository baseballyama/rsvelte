<script>
	const obj = { a: 1 };
</script>
{#await Promise.resolve((() => { let z = 1; z++; return z / 2; })())}p{:then v}<span>{v}</span>{/await}

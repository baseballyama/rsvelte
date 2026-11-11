<script>
	const obj = { a: 1 };
</script>
{#await Promise.resolve(obj.a + /\}/.source)}p{:then v}<span>{v}</span>{/await}

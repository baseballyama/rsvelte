<script>
	const obj = { a: 1 };
</script>
{#await Promise.resolve(obj.a / 2 + /x/.source.length)}p{:then v}<span>{v}</span>{/await}

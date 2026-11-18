<script>
	let n = 7;
	const pr = Promise.resolve(1);
	let items = [1, 2];
</script>
{#await pr then q}<b>{n}</b>{/await}
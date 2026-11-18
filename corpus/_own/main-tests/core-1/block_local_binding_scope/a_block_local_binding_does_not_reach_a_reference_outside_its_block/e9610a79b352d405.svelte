<script>
	const p = Promise.resolve(1);
	const xs = [1];
</script>

{#await p then code}{code}{/await}
{other}

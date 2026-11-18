<script>
	let { code } = $props();
	const p = Promise.resolve(1);
</script>

{#await p then code}{code}{/await}
{code}

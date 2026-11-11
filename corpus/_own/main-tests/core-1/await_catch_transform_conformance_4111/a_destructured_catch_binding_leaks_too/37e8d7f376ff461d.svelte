<script>
	let { code } = $props();
	const p = Promise.resolve(1);
</script>

{#await p catch { code }}{code}{/await}
{code}

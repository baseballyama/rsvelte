<script>
	const p = Promise.resolve(1);
	const xs = [1];
</script>

{#await p then code}{code}{/await}
{code}

{#each xs as code}{code}{/each}
{code}

{#each xs as v, idx}{idx}{/each}
{idx}

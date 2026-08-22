<script>
	const parts = ['<i>a</i>'];
	const p = Promise.resolve('<u>b</u>');
</script>

{#each parts as part (part)}
	{@html part}
{/each}
{#await p then value}
	{@html value}
{:catch err}
	{@html err}
{/await}
{#key parts}
	{@html parts[0]}
{/key}

<script>
	let { code, other = 1, ...rest } = $props();
	const p = Promise.resolve('x');
</script>

{code}
{rest.x}

{#await p then code}
	{code}
	<div id={code}></div>
{/await}

{#await p catch code}
	{code}
{/await}

{#await p then { code }}
	{code}
{/await}

{#await p then value}
	{value}
{/await}

{#await p then other}
	{other}
{/await}

{#each [1] as code}
	{code}
{/each}

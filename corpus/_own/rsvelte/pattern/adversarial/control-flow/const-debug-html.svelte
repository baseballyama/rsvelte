<script>
	let rows = $state([{ id: 1, kids: [{ id: 2 }] }]);
	let raw = $state('<b>x</b>');
	let p = $state(Promise.resolve(1));
	let flag = $state(true);
</script>

{#each rows as row (row.id)}
	{@const doubled = row.id * 2}
	{@debug doubled}
	<p>{doubled}</p>
	{#each row.kids as kid (kid.id)}
		{@const both = doubled + kid.id}
		<span>{both}</span>
	{/each}
{/each}

{#if flag}
	{@const only = 1}
	<i>{only}</i>
{:else}
	{@const other = 2}
	<i>{other}</i>
{/if}

{#await p}
	<em>...</em>
{:then value}
	{@const v2 = value + 1}
	<em>{v2}</em>
{:catch e}
	{@const msg = String(e)}
	<em>{msg}</em>
{/await}

{#key flag}
	{@const k = flag ? 1 : 0}
	<u>{k}</u>
{/key}

{@html raw}

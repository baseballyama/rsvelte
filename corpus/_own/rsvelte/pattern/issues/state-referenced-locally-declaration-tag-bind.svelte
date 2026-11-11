<script>
	let editing = $state(true);
	let user = $state({ name: 'a' });
</script>

{#if editing}
	{let name = $state(user.name)}
	<input bind:value={name} />
{/if}

{#each [1] as _}
	{let each_local = $state(0)}
	<input bind:value={each_local} />
{/each}

{let top = $state(0)}
<input bind:value={top} />

<!-- Must still warn: a declaration tag reading another one synchronously
     captures only the initial value. -->
{let seed = $state(1)}
{let copy = seed}
<p>{copy}</p>

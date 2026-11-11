<script>
	let rows = $state([{ id: 1, kids: [{ id: 2, tags: ['a'] }] }]);
	let show = $state(true);
</script>

{#if show}
	{#each rows as row (row.id)}
		{#key row.id}
			{#each row.kids as kid (kid.id)}
				{#if kid.tags.length}
					{#each kid.tags as tag, i (tag)}
						{#await Promise.resolve(tag)}
							<i>…</i>
						{:then resolved}
							{#if i === 0}
								<span>{row.id}-{kid.id}-{resolved}</span>
							{:else}
								<em>{resolved}</em>
							{/if}
						{/await}
					{/each}
				{/if}
			{/each}
		{/key}
	{/each}
{/if}

<button onclick={() => (show = !show)}>{rows.length}</button>

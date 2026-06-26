<script>
	let people = $state([
		{ name: 'Ada', tags: ['math', 'engines'], featured: true },
		{ name: 'Alan', tags: ['logic', 'machines'], featured: false },
		{ name: 'Grace', tags: ['compilers'], featured: true }
	]);

	let showTags = $state(true);
</script>

{#snippet chip(label)}
	<span class="chip">{label}</span>
{/snippet}

{#snippet card(person, index)}
	{@const initials = person.name.slice(0, 1).toUpperCase()}
	<article class="card" class:featured={person.featured}>
		<div class="avatar">{initials}</div>
		<div class="body">
			<h3>#{index + 1} — {person.name}</h3>
			{#if showTags && person.tags.length}
				<div class="tags">
					{#each person.tags as tag}
						{@render chip(tag)}
					{/each}
				</div>
			{/if}
		</div>
		{#if person.featured}
			{@render chip('★ featured')}
		{/if}
	</article>
{/snippet}

<div class="toolbar">
	<label>
		<input type="checkbox" bind:checked={showTags} />
		Show tags
	</label>
</div>

<section class="people">
	{#each people as person, i (person.name)}
		{@render card(person, i)}
	{/each}
</section>

{#if people.length === 0}
	{@render empty()}
{/if}

{#snippet empty()}
	<p class="empty">No people yet.</p>
{/snippet}

<style>
	.people {
		display: grid;
		gap: 0.75rem;
	}

	.card {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.card.featured {
		border-color: #fbbf24;
	}

	.avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: #eef2ff;
		font-weight: 700;
	}

	.chip {
		display: inline-block;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: #f3f4f6;
		font-size: 0.75rem;
	}

	.tags {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
</style>

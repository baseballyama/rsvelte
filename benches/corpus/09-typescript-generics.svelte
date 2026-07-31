<script module lang="ts">
	export type Row = {
		id: string;
		label: string;
		active?: boolean;
	};
</script>

<script lang="ts" generics="T extends Row">
	type Props = {
		rows: T[];
		initial?: T | null;
		onselect?: (row: T) => void;
	};

	let { rows, initial = null, onselect = () => {} }: Props = $props();
	let query = $state('');
	let selected = $state<T | null>(initial);
	let visible = $derived(
		rows.filter(
			(row): row is T =>
				row.active !== false && row.label.toLowerCase().includes(query.toLowerCase())
		)
	);

	function choose(row: T) {
		selected = row;
		onselect(row);
	}
</script>

{#snippet result(row: T, index: number)}
	<button
		class:selected={selected?.id === row.id}
		aria-pressed={selected?.id === row.id}
		onclick={() => choose(row)}
	>
		<span>{index + 1}. {row.label}</span>
		<small>{row.id as string}</small>
	</button>
{/snippet}

<section>
	<label>
		Filter
		<input bind:value={query} />
	</label>

	{#if visible.length}
		<div class="results">
			{#each visible as row, index (row.id)}
				{@render result(row, index)}
			{/each}
		</div>
	{:else}
		<p>No typed rows match.</p>
	{/if}
</section>

<style>
	section {
		display: grid;
		gap: 0.75rem;
	}

	.results {
		display: grid;
		gap: 0.25rem;
	}

	button {
		display: flex;
		justify-content: space-between;
	}

	button.selected {
		font-weight: 700;
	}
</style>

<script lang="ts">
	type Id = string;

	interface Item {
		id: Id;
		label: string;
		active: boolean;
	}

	type Group = {
		name: string;
		items: Item[];
	};

	type ItemIndex = Record<Id, Item>;

	let { groups = [], title = 'Items' } = $props();
	let selected = $state<Id | null>(null);
	let visible = $derived(
		(groups as Group[]).flatMap((group) => group.items).filter((item) => item.active)
	);
	let itemIndex = $derived(
		visible.reduce<ItemIndex>((index, item) => {
			index[item.id] = item;
			return index;
		}, {})
	);
</script>

<section>
	<h2>{title}</h2>
	{#each visible as item (item.id)}
		<button class:selected={selected === item.id} onclick={() => (selected = item.id)}>
			{item.label}
		</button>
	{/each}
	{#if selected && itemIndex[selected]}
		<p>Selected: {itemIndex[selected].label}</p>
	{/if}
</section>

<style>
	section {
		display: grid;
		gap: 0.5rem;
	}

	button.selected {
		font-weight: 700;
	}
</style>

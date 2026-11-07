<script lang="ts">
	import type { Extension } from '$lib/store';
	import ExtensionListItem from './ExtensionListItem.svelte';
	import { extensionsStore } from './store.svelte';
	import BaseList from '$lib/components/BaseList.svelte';
	import type { VListHandle } from 'virtua/svelte';

	type DisplayItem = {
		id: string | number;
		itemType: 'header' | 'item';
		data: Extension | string;
	};

	type Props = {
		items: DisplayItem[];
		onSelect: (ext: Extension) => void;
		onScroll: (offset: number) => void;
		vlistInstance: VListHandle | null;
	};

	let { items, onSelect, onScroll, vlistInstance = $bindable() }: Props = $props();
</script>

{#if extensionsStore.error}
	<div class="flex h-full items-center justify-center text-red-500">
		Error: {extensionsStore.error}
	</div>
{:else if items.length === 0}
	{#if !extensionsStore.isSearching}
		<div class="text-muted-foreground flex h-full items-center justify-center">
			{#if extensionsStore.searchText}
				No results for "{extensionsStore.searchText}"
			{:else if extensionsStore.selectedCategory !== 'All Categories'}
				No extensions found in this category.
			{/if}
		</div>
	{/if}
{:else}
	<BaseList
		{items}
		onenter={(item) => onSelect(item.data as Extension)}
		bind:selectedIndex={extensionsStore.selectedIndex}
		isItemSelectable={(item) => item.itemType === 'item'}
		onscroll={onScroll}
		bind:vlistInstance
	>
		{#snippet itemSnippet({ item, isSelected, onclick })}
			{#if item.itemType === 'header'}
				<h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase">
					{item.data}
				</h3>
			{:else if item.itemType === 'item'}
				<ExtensionListItem ext={item.data as Extension} {isSelected} {onclick} />
			{/if}
		{/snippet}
	</BaseList>
{/if}

{#if !extensionsStore.searchText && extensionsStore.isFetchingMore}
	<div class="text-muted-foreground flex h-10 items-center justify-center">Loading more...</div>
{/if}

<script lang="ts" generics="T extends { id: string | number }">
	import { VList, type VListHandle } from 'virtua/svelte';
	import type { Snippet } from 'svelte';
	import { focusManager } from '$lib/focus.svelte';

	type Props = {
		items: T[];
		itemSnippet: Snippet<[{ item: T; isSelected: boolean; onclick: () => void }]>;
		onenter: (item: T) => void;
		isItemSelectable?: (item: T) => boolean;
		selectedIndex?: number;
		listElement?: HTMLElement | null;
		onscroll?: (offset: number) => void;
		vlistInstance?: VListHandle | null;
	};

	let {
		items,
		itemSnippet,
		onenter,
		isItemSelectable = () => true,
		selectedIndex = $bindable(0),
		listElement = $bindable(),
		onscroll,
		vlistInstance = $bindable()
	}: Props = $props();

	function findNextSelectableIndex(startIndex: number, direction: 1 | -1): number {
		if (items.length === 0) return -1;
		let currentIndex = startIndex;
		for (let i = 0; i < items.length; i++) {
			currentIndex = (currentIndex + direction + items.length) % items.length;
			if (isItemSelectable(items[currentIndex])) {
				return currentIndex;
			}
		}
		return -1;
	}

	$effect(() => {
		if (items.length > 0 && (selectedIndex < 0 || !isItemSelectable(items[selectedIndex]))) {
			selectedIndex = findNextSelectableIndex(selectedIndex, 1);
		} else if (selectedIndex >= items.length) {
			selectedIndex = findNextSelectableIndex(items.length - 1, 1);
		}
	});

	$effect(() => {
		if (selectedIndex !== -1 && vlistInstance) {
			vlistInstance.scrollToIndex(selectedIndex, { align: 'nearest' });
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (focusManager.activeScope !== 'main-input') {
			return;
		}

		if (items.length === 0) return;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = findNextSelectableIndex(selectedIndex, -1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = findNextSelectableIndex(selectedIndex, 1);
				break;
		}
	}

	function handleClick(index: number) {
		if (isItemSelectable(items[index])) {
			selectedIndex = index;
			onenter(items[index]);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div bind:this={listElement} class="h-full">
	<VList
		bind:this={vlistInstance}
		data={items}
		getKey={(item) => item.id}
		class="h-full py-2"
		{onscroll}
	>
		{#snippet children(item, index)}
			<div data-index={index} class="mx-2">
				{@render itemSnippet({
					item,
					isSelected: selectedIndex === index,
					onclick: () => handleClick(index)
				})}
			</div>
		{/snippet}
	</VList>
</div>

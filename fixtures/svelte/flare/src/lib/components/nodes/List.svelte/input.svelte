<script lang="ts">
	import type { UINode } from '$lib/types';
	import type { ListItemProps } from '$lib/props';
	import ListItem from './ListItem.svelte';
	import ListSection from './ListSection.svelte';
	import { _useBaseView } from '$lib/views/base.svelte';
	import { useTypedNode } from '$lib/node.svelte';
	import BaseList from '$lib/components/BaseList.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onSelect: (nodeId: number | undefined) => void;
		searchText: string;
	};
	let { nodeId, uiTree, onSelect, searchText }: Props = $props();

	const { props: listProps } = $derived.by(useTypedNode(() => ({ nodeId, uiTree, type: 'List' })));

	const view = _useBaseView(
		() => ({
			nodeId,
			uiTree,
			onSelect,
			searchText,
			filtering: listProps?.filtering,
			onSearchTextChange: !!listProps?.onSearchTextChange
		}),
		'List.Item'
	);

	const listData = $derived(view.flatList);
</script>

<div class="flex h-full flex-col">
	<div class="flex-grow">
		<BaseList
			items={listData}
			bind:selectedIndex={view.selectedItemIndex}
			isItemSelectable={(item) => item.type === 'item'}
			onenter={() => {}}
		>
			{#snippet itemSnippet({ item, isSelected, onclick })}
				{#if item.type === 'header'}
					<ListSection props={item.props} />
				{:else if item.type === 'item'}
					<ListItem props={item.props as ListItemProps} selected={isSelected} {onclick} />
				{/if}
			{/snippet}
		</BaseList>
	</div>
</div>

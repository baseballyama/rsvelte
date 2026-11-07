<script lang="ts">
	import type { UINode } from '$lib/types';
	import GridSection from './GridSection.svelte';
	import GridItem from './GridItem.svelte';
	import { useGridView } from '$lib/views';
	import { useTypedNode } from '$lib/node.svelte';
	import { VList, type VListHandle } from 'virtua/svelte';
	import NodeRenderer from '../NodeRenderer.svelte';
	import { Loader2 } from '@lucide/svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onSelect: (nodeId: number | undefined) => void;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
		searchText: string;
	};
	let { nodeId, uiTree, onSelect, onDispatch, searchText }: Props = $props();

	const { props: gridProps } = $derived.by(useTypedNode(() => ({ nodeId, uiTree, type: 'Grid' })));

	const view = useGridView(() => ({
		nodeId,
		uiTree,
		onSelect,
		gridProps,
		searchText,
		onDispatch: (handlerName, args) => onDispatch(nodeId, handlerName, args)
	}));

	let vlist: VListHandle | null = $state(null);
	$effect(() => {
		view.vlistInstance = vlist ?? undefined;
	});

	const showEmptyView = $derived(
		!gridProps?.isLoading && view.allItems.length === 0 && !!view.emptyViewNodeId
	);
</script>

<svelte:window onkeydown={view.handleKeydown} />

<div class="flex h-full flex-col">
	<div class="grow overflow-y-auto px-4">
		{#if showEmptyView}
			<NodeRenderer nodeId={view.emptyViewNodeId!} {uiTree} {onDispatch} />
		{:else if gridProps?.isLoading && view.allItems.length === 0}
			<div class="flex h-full items-center justify-center">
				<Loader2 class="size-6 animate-spin text-gray-500" />
			</div>
		{:else}
			<VList
				bind:this={vlist}
				data={view.virtualListItems}
				getKey={(item) => item.id}
				class="h-full"
				onscroll={view.onScroll}
			>
				{#snippet children(item)}
					<div class="h-2"></div>
					{#if item.type === 'header'}
						<GridSection props={item.props} />
					{:else if item.type === 'row'}
						{@const { columns, ...styling } = item.styling}
						<div
							class="grid content-start gap-x-2.5"
							style:grid-template-columns={`repeat(${columns}, 1fr)`}
						>
							{#each item.items as gridItem (gridItem.id)}
								{@const flatIndex = view.allItems.findIndex((f) => f.id === gridItem.id)}
								<div id="item-{gridItem.id}">
									<GridItem
										props={gridItem.props}
										selected={view.selectedIndex === flatIndex}
										onclick={() => view.setSelectedIndex(flatIndex)}
										inset={styling.inset}
										fit={styling.fit}
										aspectRatio={styling.aspectRatio}
									/>
								</div>
							{/each}
						</div>
					{:else if item.type === 'placeholder'}
						<div class="aspect-square w-full animate-pulse rounded-md bg-white/5"></div>
					{/if}
				{/snippet}
			</VList>
		{/if}
	</div>
</div>

<script lang="ts">
	import type { UINode } from '$lib/types';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';
	import List from '$lib/components/nodes/List.svelte';
	import Grid from '$lib/components/nodes/Grid.svelte';
	import Detail from '$lib/components/nodes/detail/Detail.svelte';

	type Props = {
		rootNode: UINode | undefined;
		selectedItemNode: UINode | undefined;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
		onSelect: (nodeId: number | undefined) => void;
		searchText: string;
	};

	let { rootNode, selectedItemNode, uiTree, onDispatch, onSelect, searchText }: Props = $props();

	const isShowingDetail = $derived(
		rootNode?.type === 'List' && (rootNode.props.isShowingDetail as boolean)
	);
	const detailNodeId = $derived(selectedItemNode?.namedChildren?.detail);
</script>

<div
	class="grid w-full grow overflow-y-auto"
	style:grid-template-columns={isShowingDetail ? '1fr 512px' : '1fr'}
>
	<div class="h-full overflow-y-auto">
		{#if rootNode}
			{#if rootNode.type === 'List'}
				<List nodeId={rootNode.id} {uiTree} {onSelect} {searchText} />
			{:else if rootNode.type === 'Grid'}
				<Grid nodeId={rootNode.id} {uiTree} {onDispatch} {onSelect} {searchText} />
			{:else if rootNode.type === 'Detail'}
				<Detail nodeId={rootNode.id} {uiTree} {onDispatch} />
			{:else}
				<NodeRenderer nodeId={rootNode.id} {uiTree} {onDispatch} />
			{/if}
		{/if}
	</div>
	{#if isShowingDetail}
		<div class="h-full border-l">
			{#if detailNodeId}
				<NodeRenderer nodeId={detailNodeId} {uiTree} {onDispatch} />
			{/if}
		</div>
	{/if}
</div>

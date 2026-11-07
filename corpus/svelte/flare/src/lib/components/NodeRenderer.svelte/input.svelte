<script lang="ts">
	import type { UINode } from '$lib/types';
	import { componentMap } from '$lib/nodes';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
		displayAs?: 'item' | 'button';
		primaryActionNodeId?: number;
		secondaryActionNodeId?: number;
		selectedValue?: string;
	};

	let { nodeId, uiTree, onDispatch, ...restProps }: Props = $props();
	const node = $derived(uiTree.get(nodeId));
	const Component = $derived(node ? componentMap.get(node.type) : null);
</script>

{#if node && Component}
	<Component {nodeId} {uiTree} {onDispatch} {...restProps} />
{:else if node}
	<div class="p-2 text-xs text-red-500">Unknown component type: {node.type}</div>
{/if}

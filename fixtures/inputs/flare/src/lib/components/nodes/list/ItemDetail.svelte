<script lang="ts">
	import type { UINode } from '$lib/types';
	import Detail from '$lib/components/nodes/detail/Detail.svelte';
	import { useTypedNode } from '$lib/node.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { node, props: detailProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'List.Item.Detail' }))
	);
</script>

{#if node && detailProps}
	<Detail {nodeId} {uiTree} {onDispatch} layout="vertical" />
{/if}

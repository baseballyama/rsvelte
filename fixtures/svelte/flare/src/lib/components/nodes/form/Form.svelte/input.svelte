<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { node, props: formProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'Form' }))
	);
</script>

{#if node && formProps}
	<div class="flex h-full flex-col p-4">
		<div class="flex flex-col gap-4">
			{#each node.children as childId (childId)}
				<NodeRenderer nodeId={childId} {uiTree} {onDispatch} />
			{/each}
		</div>
	</div>
{/if}

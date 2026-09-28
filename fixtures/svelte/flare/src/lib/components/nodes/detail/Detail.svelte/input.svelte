<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';
	import SvelteMarked from 'svelte-marked';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
		layout?: 'horizontal' | 'vertical';
	};

	let { nodeId, uiTree, onDispatch, layout = 'horizontal' }: Props = $props();

	const { node, props: detailProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: ['Detail', 'List.Item.Detail'] }))
	);

	const metadataNodeId = $derived(node?.namedChildren?.['metadata']);
</script>

{#if node && detailProps}
	<div
		class="flex h-full"
		class:flex-row={layout === 'horizontal'}
		class:flex-col={layout === 'vertical'}
	>
		<main
			class="w-full overflow-y-auto"
			class:p-6={layout === 'horizontal'}
			class:p-4={layout === 'vertical'}
		>
			{#if detailProps.markdown}
				<article
					class="prose dark:prose-invert prose-img:mx-auto prose-img:max-w-full prose-sm max-w-full"
				>
					<SvelteMarked source={detailProps.markdown} />
				</article>
			{/if}
		</main>

		{#if metadataNodeId}
			<aside
				class="shrink-0 overflow-y-auto p-4"
				class:w-72={layout === 'horizontal'}
				class:border-l={layout === 'horizontal'}
				class:border-t={layout === 'vertical'}
			>
				<NodeRenderer nodeId={metadataNodeId} {uiTree} {onDispatch} />
			</aside>
		{/if}
	</div>
{/if}

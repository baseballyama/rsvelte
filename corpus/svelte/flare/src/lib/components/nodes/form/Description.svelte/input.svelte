<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
	};

	let { nodeId, uiTree }: Props = $props();

	const { node, props: componentProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'Form.Description' }))
	);
</script>

{#if node && componentProps}
	<div class="flex gap-4">
		{#if componentProps.title}
			<h3 class="text-muted-foreground pt-2 text-right text-sm font-medium">
				{componentProps.title}
			</h3>
		{/if}
		<p class="text-muted-foreground col-start-2 pt-2 text-sm">{componentProps.text}</p>
	</div>
{/if}

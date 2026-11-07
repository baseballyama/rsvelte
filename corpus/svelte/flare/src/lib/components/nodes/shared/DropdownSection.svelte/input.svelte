<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import * as Command from '$lib/components/ui/command';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
		selectedValue?: string;
	};

	let { nodeId, uiTree, onDispatch, selectedValue }: Props = $props();

	const { node, props: sectionProps } = $derived.by(
		useTypedNode(() => ({
			nodeId,
			uiTree,
			type: ['List.Dropdown.Section', 'Grid.Dropdown.Section', 'Form.Dropdown.Section']
		}))
	);
</script>

{#if node && sectionProps}
	<Command.Separator class="my-2" />
	<Command.Group heading={sectionProps.title} class="p-0">
		{#each node.children as childId (childId)}
			<NodeRenderer nodeId={childId} {uiTree} {onDispatch} {selectedValue} />
		{/each}
	</Command.Group>
{/if}

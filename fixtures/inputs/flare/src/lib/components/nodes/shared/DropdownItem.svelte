<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { getContext } from 'svelte';
	import * as Command from '$lib/components/ui/command';
	import Icon from '$lib/components/Icon.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { props: componentProps } = $derived.by(
		useTypedNode(() => ({
			nodeId,
			uiTree,
			type: ['List.Dropdown.Item', 'Grid.Dropdown.Item', 'Form.Dropdown.Item']
		}))
	);

	const dropdownContext = getContext<{
		onSelect: (value: string) => void;
		displayValue: () => string | undefined;
	}>('unified-dropdown');
</script>

{#if componentProps && dropdownContext}
	<Command.Item
		value={componentProps.value ?? componentProps.title}
		keywords={[...(componentProps.keywords ?? []), componentProps.title]}
		onSelect={() => {
			dropdownContext.onSelect(componentProps.value);
			onDispatch(nodeId, 'onSelect', [componentProps.value]);
		}}
		class="mx-2 h-9 px-2.5"
	>
		{#if componentProps.icon}
			<Icon icon={componentProps.icon} class="mr-2 size-[18px]" />
		{/if}
		{componentProps.title}
	</Command.Item>
{/if}

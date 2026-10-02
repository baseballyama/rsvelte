<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import Icon from '$lib/components/Icon.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
	};

	let { nodeId, uiTree }: Props = $props();
	const { props: componentProps } = $derived.by(
		useTypedNode(() => ({
			nodeId,
			uiTree,
			type: ['Detail.Metadata.Label', 'List.Item.Detail.Metadata.Label']
		}))
	);

	const textValue = $derived(
		typeof componentProps?.text === 'object' ? componentProps.text.value : componentProps?.text
	);
	const textColor = $derived(
		typeof componentProps?.text === 'object' ? componentProps.text.color : undefined
	);
</script>

{#if componentProps}
	<div>
		<h3 class="text-muted-foreground mb-1 text-xs font-medium">{componentProps.title}</h3>
		<div class="flex items-center gap-2">
			{#if componentProps.icon}
				<Icon icon={componentProps.icon} class="size-4" />
			{/if}
			{#if textValue}
				<span class="text-sm" style:color={textColor}>{textValue}</span>
			{/if}
		</div>
	</div>
{/if}

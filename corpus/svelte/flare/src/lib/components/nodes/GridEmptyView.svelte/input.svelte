<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import defaultIcon from '$lib/assets/no-results-placeholder-400100x78@2x.png';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
	};

	let { nodeId, uiTree }: Props = $props();
	const { props: componentProps } = $derived.by(
		useTypedNode(() => ({
			nodeId,
			uiTree,
			type: 'Grid.EmptyView'
		}))
	);
</script>

{#if componentProps}
	<div class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
		{#if componentProps.icon}
			<Icon icon={componentProps.icon} class="size-32 opacity-50" />
		{:else}
			<img src={defaultIcon} class="mb-6 w-[90px]" alt="No results" />
		{/if}
		<h2 class="text-lg font-medium">{componentProps.title}</h2>
		{#if componentProps.description}
			<p class="text-muted-foreground max-w-md text-sm">
				{componentProps.description}
			</p>
		{/if}
	</div>
{/if}

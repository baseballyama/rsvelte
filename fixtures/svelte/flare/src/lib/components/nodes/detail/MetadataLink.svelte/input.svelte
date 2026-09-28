<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { openUrl } from '@tauri-apps/plugin-opener';
	import { Button } from '$lib/components/ui/button';
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
			type: ['Detail.Metadata.Link', 'List.Item.Detail.Metadata.Link']
		}))
	);
</script>

{#if componentProps}
	<div>
		<h3 class="text-muted-foreground mb-1 text-xs font-medium">{componentProps.title}</h3>
		<Button
			href={componentProps.target}
			onclick={(e) => {
				e.preventDefault();
				openUrl(componentProps.target);
			}}
			class="group text-foreground flex h-auto justify-between !p-0"
			variant="link"
		>
			{componentProps.text}

			<Icon icon="arrow-ne-16" class="text-muted-foreground group-hover:text-foreground size-4" />
		</Button>
	</div>
{/if}

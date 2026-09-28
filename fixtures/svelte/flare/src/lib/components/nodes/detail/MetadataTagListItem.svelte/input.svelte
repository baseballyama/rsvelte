<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { colorLikeToColor } from '$lib/props';
	import Icon from '$lib/components/Icon.svelte';
	import 'mode-watcher';
	import { mode } from 'mode-watcher';

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
			type: ['Detail.Metadata.TagList.Item', 'List.Item.Detail.Metadata.TagList.Item']
		}))
	);
	function handleClick() {
		onDispatch(nodeId, 'onAction', []);
	}
	const color = $derived(colorLikeToColor(componentProps?.color ?? '', mode.current === 'dark'));
</script>

{#if componentProps}
	<button
		type="button"
		class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-sm"
		style:color
		style:background-color="color-mix(in srgb, {color} 15%, transparent)"
		onclick={handleClick}
	>
		{#if componentProps.icon}
			<Icon icon={componentProps.icon} class="size-[18px]" />
		{/if}
		{#if componentProps.text}
			<span>{componentProps.text}</span>
		{/if}
	</button>
{/if}

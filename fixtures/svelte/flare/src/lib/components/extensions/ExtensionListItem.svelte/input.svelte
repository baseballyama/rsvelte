<script lang="ts">
	import Icon from '../Icon.svelte';
	import { Download } from '@lucide/svelte';
	import type { Extension } from '$lib/store';
	import ListItemBase from '../nodes/shared/ListItemBase.svelte';

	type Props = {
		ext: Extension;
		isSelected: boolean;
		onclick?: () => void;
	};

	let { ext, isSelected, onclick }: Props = $props();
</script>

<ListItemBase
	title={ext.title}
	subtitle={ext.description}
	icon={ext.icons.light ? { source: ext.icons.light, mask: 'roundedRectangle' } : undefined}
	{isSelected}
	{onclick}
>
	{#snippet accessories()}
		{#if ext.commands.length > 0}
			<span class="text-muted-foreground text-sm">{ext.commands.length}</span>
		{/if}
		<div class="text-muted-foreground flex items-center gap-1 text-sm">
			<Download class="size-4" />
			{ext.download_count.toLocaleString()}
		</div>
		<Icon
			icon={ext.author.avatar ? { source: ext.author.avatar, mask: 'circle' } : undefined}
			class="size-6"
		/>
	{/snippet}
</ListItemBase>

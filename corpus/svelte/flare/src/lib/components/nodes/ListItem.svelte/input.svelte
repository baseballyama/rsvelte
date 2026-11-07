<script lang="ts">
	import type { ListItemProps } from '$lib/props';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import ListItemBase from './shared/ListItemBase.svelte';
	import Icon from '../Icon.svelte';
	import { colorLikeToColor } from '$lib/props/color';
	import { mode } from 'mode-watcher';

	type Props = {
		props: ListItemProps;
		selected: boolean;
	} & HTMLButtonAttributes;

	let { props, selected, ...restProps }: Props = $props();

	function formatRelative(date: Date): string {
		const now = new Date();
		const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
		const diffMinutes = Math.round(diffSeconds / 60);
		const diffHours = Math.round(diffMinutes / 60);
		const diffDays = Math.round(diffHours / 24);
		const diffWeeks = Math.round(diffDays / 7);
		const diffMonths = Math.round(diffDays / 30.44);
		const diffYears = Math.round(diffDays / 365.25);

		if (diffSeconds < 60) return 'now';
		if (diffMinutes < 60) return `${diffMinutes}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		if (diffWeeks < 5) return `${diffWeeks}w`;
		if (diffMonths < 12) return `${diffMonths}mo`;
		return `${diffYears}y`;
	}
</script>

<ListItemBase
	title={props.title}
	icon={props.icon}
	isSelected={selected}
	onclick={restProps.onclick}
>
	{#snippet accessories()}
		{#if props.accessories && props.accessories.length > 0}
			{#each props.accessories ?? [] as accessory, i (i)}
				{@const tagContent = accessory.tag ?? accessory.date}
				{@const textContent = accessory.text}

				<div
					class="text-muted-foreground flex items-center gap-1 text-sm"
					title={accessory.tooltip ?? undefined}
				>
					{#if accessory.icon}
						<Icon icon={accessory.icon} class="size-3.5" />
					{/if}
					{#if tagContent}
						{@const tagValue =
							typeof tagContent === 'object' && tagContent !== null && 'value' in tagContent
								? tagContent.value
								: tagContent}
						{@const tagColorProp =
							typeof tagContent === 'object' && tagContent !== null && 'color' in tagContent
								? tagContent.color
								: undefined}
						{@const tagText = tagValue instanceof Date ? formatRelative(tagValue) : tagValue}
						{@const color = tagColorProp
							? colorLikeToColor(tagColorProp, mode.current === 'dark')
							: 'var(--color-muted-foreground)'}
						<span
							class="rounded px-1.5 py-0.5 text-xs font-medium"
							style:color
							style:background-color={tagColorProp
								? `color-mix(in srgb, ${color} 15%, transparent)`
								: 'transparent'}
						>
							{tagText}
						</span>
					{:else if textContent}
						{@const textValue = typeof textContent === 'object' ? textContent.value : textContent}
						{@const textColor =
							typeof textContent === 'object' && textContent.color
								? colorLikeToColor(textContent.color, mode.current === 'dark')
								: undefined}
						<span style:color={textColor}>{textValue}</span>
					{/if}
				</div>
			{/each}
		{/if}
	{/snippet}
</ListItemBase>

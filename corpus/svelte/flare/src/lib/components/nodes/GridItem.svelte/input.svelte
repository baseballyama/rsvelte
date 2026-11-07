<script lang="ts">
	import type { GridItemProps, GridInset, GridFit } from '$lib/props';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import Icon from '../Icon.svelte';
	import { mode } from 'mode-watcher';

	type Props = {
		props: GridItemProps;
		selected: boolean;
		inset?: GridInset;
		fit?: GridFit;
		aspectRatio?: string;
	} & HTMLButtonAttributes;

	let { props, selected, inset, fit, aspectRatio, ...restProps }: Props = $props();

	const paddingClass = $derived.by(() => {
		switch (inset) {
			case 'small':
				return 'p-1.5';
			case 'medium':
				return 'p-2.5';
			case 'large':
				return 'p-4';
			default:
				return 'p-1';
		}
	});

	const content = $derived(
		typeof props.content === 'object' && 'value' in props.content
			? props.content.value
			: props.content
	);
	const tooltip = $derived(
		typeof props.content === 'object' && 'tooltip' in props.content
			? props.content.tooltip
			: undefined
	);
</script>

<button
	type="button"
	class={cn('flex w-full flex-col text-left focus:outline-none', paddingClass)}
	{...restProps}
>
	<div
		class="hover:border-foreground/50 bg-muted mb-1 w-full overflow-hidden rounded-md border-2 {selected
			? 'border-foreground'
			: 'border-transparent'}"
		class:border-transparent={!selected}
		style:aspect-ratio={aspectRatio ?? '1'}
		title={tooltip}
	>
		{#if typeof content === 'object' && 'color' in content}
			{@const color =
				typeof content.color === 'object'
					? mode.current === 'dark'
						? content.color.dark
						: content.color.light
					: content.color}

			<div class="h-full w-full" style:background-color={color}></div>
		{:else}
			<Icon
				icon={content}
				class="size-full {fit === 'contain' ? 'object-contain' : 'object-fill'}"
			/>
		{/if}
	</div>

	{#if props.title}
		<span class="truncate text-sm font-medium">{props.title}</span>
	{/if}
	{#if props.subtitle}
		<span class="text-muted-foreground truncate text-xs">{props.subtitle}</span>
	{/if}
	{#if props.accessory}
		<div
			class="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs"
			title={props.accessory.tooltip}
		>
			{#if props.accessory.icon}
				<Icon icon={props.accessory.icon} class="size-3" />
			{/if}
			{#if props.accessory.text}
				<span class="truncate">{props.accessory.text}</span>
			{/if}
		</div>
	{/if}
</button>

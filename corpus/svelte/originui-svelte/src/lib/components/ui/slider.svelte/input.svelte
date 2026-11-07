<script lang="ts">
	import { cn } from '$lib/utils.js';

	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
	import { Slider as SliderPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import { on } from 'svelte/events';

	let {
		class: className,
		orientation = 'horizontal',
		ref = $bindable(null),
		showTooltip = false,
		tooltipContent,
		value = $bindable(),
		...restProps
	}: WithoutChildrenOrChild<
		SliderPrimitive.RootProps & {
			showTooltip?: boolean;
			tooltipContent?: (value: number) => number | string;
		}
	> = $props();

	let tooltipOpen = $state(false);

	function handlePointerUp() {
		tooltipOpen = false;
	}

	function handlePointerDown() {
		tooltipOpen = true;
	}

	$effect(() => {
		if (showTooltip) {
			const cleanup = on(document, 'pointerup', handlePointerUp);
			return cleanup;
		}
	});
</script>

{#snippet thumb(props: SliderPrimitive.ThumbProps)}
	<SliderPrimitive.Thumb
		class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-xs outline-hidden transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
		{...props}
	/>
{/snippet}

<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	{orientation}
	class={cn(
		'relative flex w-full touch-none items-center select-none disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
		className
	)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-orientation={orientation}
			class="bg-secondary relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"
		>
			<SliderPrimitive.Range
				data-orientation={orientation}
				class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
			/>
		</span>
		{#each thumbItems as thumbItem (thumbItem.index)}
			{#if !showTooltip}
				{@render thumb({ index: thumbItem.index })}
			{:else}
				<TooltipProvider>
					<Tooltip bind:open={tooltipOpen}>
						<TooltipTrigger>
							{#snippet child({ props })}
								{@render thumb({
									index: thumbItem.index,
									...props,
									onpointerdown: handlePointerDown
								})}
							{/snippet}
						</TooltipTrigger>
						<TooltipContent
							side={orientation === 'vertical' ? 'right' : 'top'}
							sideOffset={8}
							class="border-input bg-popover text-muted-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-2 py-1 text-xs outline-hidden"
						>
							{#if Array.isArray(value)}
								{tooltipContent ? tooltipContent(value[thumbItem.index]!) : value[thumbItem.index]!}
							{:else}
								{tooltipContent ? tooltipContent(value!) : value!}
							{/if}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			{/if}
		{/each}
	{/snippet}
</SliderPrimitive.Root>

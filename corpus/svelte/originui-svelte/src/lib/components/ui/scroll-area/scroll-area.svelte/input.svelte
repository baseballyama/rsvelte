<script lang="ts">
	import Scrollbar from './scroll-area-scrollbar.svelte';
	import { cn } from '$lib/utils.js';

	import { ScrollArea as ScrollAreaPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		orientation = 'vertical',
		ref = $bindable(null),
		scrollbarXClasses = 'h-2.5 flex-col border-t border-t-transparent p-px',
		scrollbarYClasses = 'h-full w-2.5 border-l border-l-transparent p-px',
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		orientation?: 'both' | 'horizontal' | 'vertical' | undefined;
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
	} = $props();
</script>

<ScrollAreaPrimitive.Root bind:ref {...restProps} class={cn('relative overflow-hidden', className)}>
	<ScrollAreaPrimitive.Viewport class="h-full w-full  rounded-[inherit]">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === 'vertical' || orientation === 'both'}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === 'horizontal' || orientation === 'both'}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>

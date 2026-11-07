<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { ScrollArea as ScrollAreaPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		orientation = 'vertical',
		ref = $bindable(null),
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.ScrollbarProps> = $props();
</script>

<ScrollAreaPrimitive.Scrollbar
	bind:ref
	{orientation}
	class={cn(
		'flex touch-none transition-colors select-none',
		orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
		orientation === 'horizontal' && 'h-2.5 w-full border-t border-t-transparent p-px',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ScrollAreaPrimitive.Thumb
		class={cn('bg-border relative rounded-full', orientation === 'vertical' && 'flex-1')}
	/>
</ScrollAreaPrimitive.Scrollbar>

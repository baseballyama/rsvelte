<script lang="ts">
	import { cn } from '$lib/utils.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	class={cn(
		'border-input bg-background text-foreground focus:border-ring focus:ring-ring/20 data-placeholder:text-muted-foreground/70 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm shadow-xs shadow-black/5 focus:ring-[3px] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0',
		className
	)}
	{...restProps}
>
	<span class="pointer-events-none">
		{@render children?.()}
	</span>
	<ChevronDown size={16} class="text-muted-foreground/80 shrink-0" />
</SelectPrimitive.Trigger>

<script lang="ts">
	import { getToggleGroupCtx } from '$lib/components/ui/toggle-group/toggle-group.svelte';
	import { type ToggleVariants, toggleVariants } from '$lib/components/ui/toggle.svelte';
	import { cn } from '$lib/utils.js';

	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		size,
		value,
		variant,
		...restProps
	}: ToggleGroupPrimitive.ItemProps & ToggleVariants = $props();

	const ctx = getToggleGroupCtx();
</script>

<ToggleGroupPrimitive.Item
	bind:ref
	{value}
	class={cn(
		toggleVariants({
			size: ctx.size || size,
			variant: ctx.variant || variant
		}),
		'min-w-0 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
		className
	)}
	{...restProps}
/>

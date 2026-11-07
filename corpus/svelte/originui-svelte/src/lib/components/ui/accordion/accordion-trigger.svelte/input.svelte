<script lang="ts">
	import { cn } from '$lib/utils.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Accordion as AccordionPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<AccordionPrimitive.TriggerProps> = $props();
</script>

<AccordionPrimitive.Header class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		class={cn(
			'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-semibold transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<ChevronDown
			size={16}
			aria-hidden
			class="pointer-events-none shrink-0 opacity-60 transition-transform duration-200"
		/>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>

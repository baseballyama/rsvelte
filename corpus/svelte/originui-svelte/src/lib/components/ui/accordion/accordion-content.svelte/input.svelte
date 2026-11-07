<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Accordion as AccordionPrimitive, type WithoutChild } from 'bits-ui';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
	{...restProps}
>
	<div class={cn('pt-0 pb-4', className)}>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>

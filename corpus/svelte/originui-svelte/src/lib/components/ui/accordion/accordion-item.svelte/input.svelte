<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Accordion as AccordionPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: AccordionPrimitive.ItemProps = $props();
</script>

<AccordionPrimitive.Item
	data-slot="accordion-item"
	bind:ref
	class={cn('border-b', className)}
	{...restProps}
/>

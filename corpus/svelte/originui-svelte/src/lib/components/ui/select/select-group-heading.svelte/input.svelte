<script lang="ts">
	import { cn } from '$lib/utils.js';

	import { Select as SelectPrimitive } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: SelectPrimitive.GroupHeadingProps = $props();
</script>

<SelectPrimitive.GroupHeading
	bind:ref
	class={cn('text-muted-foreground py-1.5 ps-8 pe-2 text-xs font-medium', className)}
	{...restProps}
/>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import { Select as SelectPrimitive, type WithoutChildrenOrChild } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
	bind:ref
	class={cn('flex cursor-default items-center justify-center py-1', className)}
	{...restProps}
>
	<ChevronUp size={16} />
</SelectPrimitive.ScrollUpButton>

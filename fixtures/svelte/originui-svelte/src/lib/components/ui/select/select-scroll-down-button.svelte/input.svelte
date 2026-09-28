<script lang="ts">
	import { cn } from '$lib/utils.js';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Select as SelectPrimitive, type WithoutChildrenOrChild } from 'bits-ui';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollDownButton
	bind:ref
	class={cn('flex cursor-default items-center justify-center py-1', className)}
	{...restProps}
>
	<ChevronDown size={16} />
</SelectPrimitive.ScrollDownButton>

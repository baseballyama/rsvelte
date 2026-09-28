<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	aria-hidden="true"
	class={cn('flex size-9 items-center justify-center', className)}
	{...restProps}
>
	<MoreHorizontal size={16} />
	<span class="sr-only">More pages</span>
</span>

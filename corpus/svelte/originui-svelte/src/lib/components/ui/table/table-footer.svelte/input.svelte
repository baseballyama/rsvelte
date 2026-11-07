<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();
</script>

<tfoot
	bind:this={ref}
	class={cn('bg-muted/50 border-t font-medium last:[&>tr]:border-b-0', className)}
	{...restProps}
>
	{@render children?.()}
</tfoot>

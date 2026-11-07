<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	role="link"
	aria-disabled="true"
	aria-current="page"
	class={cn('text-foreground', className)}
	{...restProps}
>
	{@render children?.()}
</span>

<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	let {
		children,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div class={cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)} {...restProps}>
	{@render children?.()}
</div>

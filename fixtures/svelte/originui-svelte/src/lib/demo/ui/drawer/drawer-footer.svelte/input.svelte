<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	export { className as class };
</script>

<div bind:this={ref} class={cn('mt-auto flex flex-col gap-2 p-4', className)} {...restProps}>
	{@render children?.()}
</div>

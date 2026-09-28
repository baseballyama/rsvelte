<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLLiAttributes } from 'svelte/elements';

	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		children,
		class: className,
		ref = $bindable(null),
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li role="presentation" aria-hidden="true" class={className} bind:this={ref} {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		<ChevronRight size={16} />
	{/if}
</li>

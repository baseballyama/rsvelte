<script lang="ts">
	import PaginationLink, { type Props as PaginationLinkProps } from './pagination-link.svelte';
	import { cn } from '$lib/utils.js';

	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: Omit<PaginationLinkProps, 'children'> = $props();
</script>

<PaginationLink
	bind:ref
	aria-label="Go to next page"
	size="default"
	class={cn('gap-1 pr-2.5', className)}
	{...restProps}
>
	<span>Next</span>
	<ChevronRight size={16} />
</PaginationLink>

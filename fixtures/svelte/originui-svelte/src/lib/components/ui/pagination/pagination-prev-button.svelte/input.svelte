<script lang="ts">
	import PaginationLink, { type Props as PaginationLinkProps } from './pagination-link.svelte';
	import { cn } from '$lib/utils.js';

	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: Omit<PaginationLinkProps, 'children'> = $props();
</script>

<PaginationLink
	bind:ref
	aria-label="Go to previous page"
	size="default"
	class={cn('gap-1 pl-2.5', className)}
	{...restProps}
>
	<ChevronLeft size={16} />
	<span>Previous</span>
</PaginationLink>

<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button.svelte';

	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		Pagination,
		PaginationContent,
		PaginationItem,
		PaginationLink
	} from '$lib/components/ui/pagination';
	import { cn } from '$lib/utils';

	type PaginationProps = {
		currentPage: number;
		totalPages: number;
	};
	let { currentPage = 1, totalPages = 10 }: PaginationProps = $props();
</script>

<Pagination>
	<PaginationContent class="w-full justify-between">
		<PaginationItem>
			<PaginationLink
				class={cn(
					'aria-disabled:pointer-events-none aria-disabled:opacity-50',
					buttonVariants({
						variant: 'outline'
					})
				)}
				aria-label="Go to previous page"
				aria-disabled={currentPage === 1 ? true : undefined}
				role={currentPage === 1 ? 'link' : undefined}
			>
				<ChevronLeft size={16} aria-hidden="true" />
			</PaginationLink>
		</PaginationItem>
		<PaginationItem>
			<p class="text-muted-foreground text-sm" aria-live="polite">
				Page <span class="text-foreground">{currentPage}</span> of
				<span class="text-foreground">{totalPages}</span>
			</p>
		</PaginationItem>
		<PaginationItem>
			<PaginationLink
				class={cn(
					'aria-disabled:pointer-events-none aria-disabled:opacity-50',
					buttonVariants({
						variant: 'outline'
					})
				)}
				href={currentPage === totalPages ? undefined : `#/page/${currentPage + 1}`}
				aria-label="Go to next page"
				aria-disabled={currentPage === totalPages ? true : undefined}
				role={currentPage === totalPages ? 'link' : undefined}
			>
				<ChevronRight size={16} aria-hidden="true" />
			</PaginationLink>
		</PaginationItem>
	</PaginationContent>
</Pagination>

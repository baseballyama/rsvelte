<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button.svelte';
	import { usePagination } from '$lib/hooks/use-pagination.svelte';

	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		Pagination,
		PaginationContent,
		PaginationEllipsis,
		PaginationItem,
		PaginationLink
	} from '$lib/components/ui/pagination';
	import { cn } from '$lib/utils';

	type PaginationProps = {
		currentPage: number;
		paginationItemsToDisplay?: number;
		totalPages: number;
	};

	let {
		currentPage = 1,
		paginationItemsToDisplay = 5,
		totalPages = 10
	}: PaginationProps = $props();

	const pagination = usePagination({
		currentPage,
		paginationItemsToDisplay,
		totalPages
	});
</script>

<Pagination>
	<PaginationContent
		class="inline-flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5 rtl:space-x-reverse"
	>
		<!-- Previous page button -->
		<PaginationItem class="[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg">
			<PaginationLink
				class={cn(
					buttonVariants({
						variant: 'outline'
					}),
					'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'
				)}
				href={currentPage === 1 ? undefined : `#/page/${currentPage - 1}`}
				aria-label="Go to previous page"
				aria-disabled={currentPage === 1 ? true : undefined}
				role={currentPage === 1 ? 'link' : undefined}
			>
				<ChevronLeft size={16} aria-hidden="true" />
			</PaginationLink>
		</PaginationItem>

		<!-- Left ellipsis (...) -->
		{#if pagination.showLeftEllipsis}
			<PaginationItem class="[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg">
				<PaginationEllipsis />
			</PaginationItem>
		{/if}

		<!-- Page number links  -->
		{#each pagination.pages as page (page)}
			<PaginationItem>
				<PaginationLink
					class={cn(
						buttonVariants({
							variant: 'outline'
						}),
						'rounded-none shadow-none focus-visible:z-10',
						page === currentPage && 'bg-accent'
					)}
					href="#/page/{page}"
					isActive={page === currentPage}
				>
					{page}
				</PaginationLink>
			</PaginationItem>
		{/each}

		<!-- Right ellipsis (...) -->
		{#if pagination.showRightEllipsis}
			<PaginationItem class="[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg">
				<PaginationEllipsis
					class={cn(
						buttonVariants({
							variant: 'outline'
						}),
						'pointer-events-none rounded-none shadow-none'
					)}
				/>
			</PaginationItem>
		{/if}

		<!-- Next page button -->
		<PaginationItem class="[&:first-child>a]:rounded-s-lg [&:last-child>a]:rounded-e-lg">
			<PaginationLink
				class={cn(
					buttonVariants({
						variant: 'outline'
					}),
					'rounded-none shadow-none focus-visible:z-10 aria-disabled:pointer-events-none [&[aria-disabled]>svg]:opacity-50'
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

<script lang="ts">
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
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

<div class="flex items-center justify-between gap-4">
	<!-- Pagination -->
	<div>
		<Pagination>
			<PaginationContent>
				<!-- Previous page button -->
				<PaginationItem>
					<PaginationLink
						class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
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
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				{/if}

				<!-- Page number links -->
				{#each pagination.pages as page (page)}
					<PaginationItem>
						<PaginationLink href="#/page/{page}" isActive={page === currentPage}>
							{page}
						</PaginationLink>
					</PaginationItem>
				{/each}

				<!-- Right ellipsis (...)  -->
				{#if pagination.showRightEllipsis}
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				{/if}

				<!-- Next page button -->
				<PaginationItem>
					<PaginationLink
						class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
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
	</div>

	<!-- Go to page input  -->
	<div class="flex items-center gap-3">
		<Label for="pagination-input" class="whitespace-nowrap">Go to page</Label>
		<Input id="pagination-input" type="text" class="w-14" value={String(currentPage)} />
	</div>
</div>

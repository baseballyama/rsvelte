<script lang="ts">
	import { usePagination } from '$lib/hooks/use-pagination.svelte';

	import ChevronFirst from '@lucide/svelte/icons/chevron-first';
	import ChevronLast from '@lucide/svelte/icons/chevron-last';
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

<Pagination>
	<PaginationContent>
		<!-- First page button -->
		<PaginationItem>
			<PaginationLink
				class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
				href={currentPage === 1 ? undefined : `#/page/${currentPage - 1}`}
				aria-label="Go to first page"
				aria-disabled={currentPage === 1 ? true : undefined}
				role={currentPage === 1 ? 'link' : undefined}
			>
				<ChevronFirst size={16} aria-hidden="true" />
			</PaginationLink>
		</PaginationItem>

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

		<!-- Page number links  -->
		{#each pagination.pages as page (page)}
			<PaginationItem>
				<PaginationLink href="#/page/{page}" isActive={page === currentPage}>
					{page}
				</PaginationLink>
			</PaginationItem>
		{/each}

		<!-- Right ellipsis (...) -->
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

		<!-- Last page button -->
		<PaginationItem>
			<PaginationLink
				class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
				href={currentPage === totalPages ? undefined : `#/page/${totalPages}`}
				aria-label="Go to last page"
				aria-disabled={currentPage === totalPages ? true : undefined}
				role={currentPage === totalPages ? 'link' : undefined}
			>
				<ChevronLast size={16} aria-hidden="true" />
			</PaginationLink>
		</PaginationItem>
	</PaginationContent>
</Pagination>

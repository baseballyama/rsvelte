<script lang="ts">
	import { usePagination } from '$lib/hooks/use-pagination.svelte';

	import {
		Pagination,
		PaginationContent,
		PaginationEllipsis,
		PaginationItem,
		PaginationLink,
		PaginationNextButton,
		PaginationPrevButton
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
		<!-- Previous page button -->
		<PaginationItem>
			<PaginationPrevButton
				class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
				href={currentPage === 1 ? undefined : `#/page/${currentPage - 1}`}
				aria-disabled={currentPage === 1 ? true : undefined}
				role={currentPage === 1 ? 'link' : undefined}
			/>
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
			<PaginationNextButton
				class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
				href={currentPage === totalPages ? undefined : `#/page/${currentPage + 1}`}
				aria-disabled={currentPage === totalPages ? true : undefined}
				role={currentPage === totalPages ? 'link' : undefined}
			/>
		</PaginationItem>
	</PaginationContent>
</Pagination>

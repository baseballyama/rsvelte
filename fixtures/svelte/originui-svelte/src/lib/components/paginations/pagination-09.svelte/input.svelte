<script lang="ts">
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
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

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

	const paginationItemsToDisplayOptions = ['10', '20', '50', '100'];
	let selectedPaginationItemsToDisplay = $state(paginationItemsToDisplayOptions[0]);
</script>

<div class="flex items-center justify-between gap-3">
	<!-- Page number information -->
	<p class="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">
		Page <span class="text-foreground">{currentPage}</span> of
		<span class="text-foreground">{totalPages}</span>
	</p>
	<!--  Pagination  -->
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
			</PaginationContent>
		</Pagination>
	</div>

	<div class="flex flex-1 justify-end">
		<Select bind:value={selectedPaginationItemsToDisplay} type="single">
			<SelectTrigger
				id="results-per-page"
				class="w-fit whitespace-nowrap"
				aria-label="Results per page"
			>
				{#if selectedPaginationItemsToDisplay}
					{selectedPaginationItemsToDisplay} / page
				{:else}
					Select number of results
				{/if}
			</SelectTrigger>
			<SelectContent>
				{#each paginationItemsToDisplayOptions as option (option)}
					<SelectItem value={option}>{option} / page</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>
</div>

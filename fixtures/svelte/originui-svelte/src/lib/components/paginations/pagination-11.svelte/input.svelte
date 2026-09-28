<script lang="ts">
	import ChevronFirst from '@lucide/svelte/icons/chevron-first';
	import ChevronLast from '@lucide/svelte/icons/chevron-last';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		Pagination,
		PaginationContent,
		PaginationItem,
		PaginationLink
	} from '$lib/components/ui/pagination';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

	type PaginationProps = {
		currentPage: number;
		totalPages: number;
	};

	let { currentPage = 1, totalPages = 10 }: PaginationProps = $props();

	const paginationItemsToDisplayOptions = Array.from({ length: totalPages }, (_, i) => i + 1);
	let selectedPaginationItemsToDisplay = $state(String(paginationItemsToDisplayOptions[0]));
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

		<!-- Page number select -->
		<PaginationItem>
			<Select bind:value={selectedPaginationItemsToDisplay} type="single">
				<SelectTrigger id="select-page" class="w-fit whitespace-nowrap">
					{#if selectedPaginationItemsToDisplay}
						Page {selectedPaginationItemsToDisplay}
					{:else}
						Select page
					{/if}
				</SelectTrigger>
				<SelectContent>
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
						<SelectItem value={String(page)}>
							Page {page}
						</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</PaginationItem>

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

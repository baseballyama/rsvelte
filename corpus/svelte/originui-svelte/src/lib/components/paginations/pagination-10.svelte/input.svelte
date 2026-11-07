<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';

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

	const paginationItemsToDisplayOptions = [10, 20, 50, 100];
	let selectedPaginationItemsToDisplay = $state(paginationItemsToDisplayOptions[0]);

	function getValue() {
		return selectedPaginationItemsToDisplay.toString();
	}

	function setValue(newValue: string) {
		selectedPaginationItemsToDisplay = parseInt(newValue);
	}
</script>

<div class="flex items-center justify-between gap-8">
	<!-- Results per page -->
	<div class="flex items-center gap-3">
		<Label for="rows-per-page" class="w-fit whitespace-nowrap">Rows per page</Label>
		<Select bind:value={getValue, setValue} type="single">
			<SelectTrigger id="rows-per-page" class="w-fit whitespace-nowrap">
				{#if selectedPaginationItemsToDisplay}
					{selectedPaginationItemsToDisplay}
				{:else}
					Select number of results
				{/if}
			</SelectTrigger>
			<SelectContent
				class="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2"
			>
				{#each paginationItemsToDisplayOptions as option (option)}
					<SelectItem value={option.toString()}>{option}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>

	<!-- Page number information -->
	<div class="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
		<p class="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
			<span class="text-foreground">1-10</span> of
			<span class="text-foreground">100</span>
		</p>
	</div>

	<!--  Pagination  -->
	<div>
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
	</div>
</div>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import {
		Pagination,
		PaginationContent,
		PaginationItem,
		PaginationLink
	} from '$lib/components/ui/pagination';

	type PaginationProps = {
		currentPage: number;

		totalPages: number;
	};
	let { currentPage = 1, totalPages = 10 }: PaginationProps = $props();
</script>

<Pagination>
	<PaginationContent class="gap-3">
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
		<PaginationItem>
			<p class="text-muted-foreground text-sm" aria-live="polite">
				Page <span class="text-foreground">{currentPage}</span> of
				<span class="text-foreground">{totalPages}</span>
			</p>
		</PaginationItem>
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

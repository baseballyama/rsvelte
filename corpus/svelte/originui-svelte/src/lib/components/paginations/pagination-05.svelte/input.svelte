<script lang="ts">
	import Button from '../ui/button.svelte';

	import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

	type PaginationProps = {
		currentPage: number;
		totalPages: number;
	};
	let { currentPage = 1, totalPages = 10 }: PaginationProps = $props();
</script>

<div class="flex items-center justify-between gap-3">
	<p class="text-muted-foreground grow text-sm" aria-live="polite">
		Page <span class="text-foreground">{currentPage}</span> of
		<span class="text-foreground">{totalPages}</span>
	</p>

	<Pagination class="w-auto">
		<PaginationContent class="gap-3">
			<PaginationItem>
				<Button
					variant="outline"
					class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
					aria-disabled={currentPage === 1 ? true : undefined}
					role={currentPage === 1 ? 'link' : undefined}
					href={currentPage === 1 ? undefined : `#/page/${currentPage - 1}`}
				>
					Previous
				</Button>
			</PaginationItem>

			<PaginationItem>
				<Button
					variant="outline"
					class="aria-disabled:pointer-events-none aria-disabled:opacity-50"
					aria-disabled={currentPage === totalPages ? true : undefined}
					role={currentPage === totalPages ? 'link' : undefined}
					href={currentPage === totalPages ? undefined : `#/page/${currentPage + 1}`}
				>
					Next
				</Button>
			</PaginationItem>
		</PaginationContent>
	</Pagination>
</div>

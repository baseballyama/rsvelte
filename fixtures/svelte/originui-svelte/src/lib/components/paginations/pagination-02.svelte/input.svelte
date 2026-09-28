<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { Pagination, PaginationContent, PaginationItem } from '$lib/components/ui/pagination';

	type PaginationProps = {
		currentPage: number;
		totalPages: number;
	};
	let { currentPage = 1, totalPages = 10 }: PaginationProps = $props();
</script>

<Pagination>
	<PaginationContent class="w-full justify-between gap-3">
		<PaginationItem>
			<Button
				variant="ghost"
				class="group aria-disabled:pointer-events-none aria-disabled:opacity-50"
				aria-disabled={currentPage === 1 ? true : undefined}
				role={currentPage === 1 ? 'link' : undefined}
			>
				<ArrowLeft
					class="-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
					size={16}
					aria-hidden="true"
				/>
				Previous
			</Button>
		</PaginationItem>
		<PaginationItem>
			<Button
				variant="ghost"
				class="group aria-disabled:pointer-events-none aria-disabled:opacity-50"
				aria-disabled={currentPage === totalPages ? true : undefined}
				role={currentPage === totalPages ? 'link' : undefined}
			>
				Next
				<ArrowRight
					class="ms-2 -me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
					size={16}
					aria-hidden="true"
				/>
			</Button>
		</PaginationItem>
	</PaginationContent>
</Pagination>

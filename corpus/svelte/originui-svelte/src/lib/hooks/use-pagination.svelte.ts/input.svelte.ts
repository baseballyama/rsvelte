export type UsePaginationProps = {
	currentPage: number;
	paginationItemsToDisplay: number;
	totalPages: number;
};

export class Pagination {
	currentPage = $state(1);
	totalPages = $state(1);
	#itemsCount = $state(5);

	showLeftEllipsis = $derived(this.currentPage > Math.ceil(this.#itemsCount / 2));
	showRightEllipsis = $derived(
		this.totalPages - this.currentPage >= Math.ceil(this.#itemsCount / 2)
	);

	pages = $derived.by(() => {
		if (this.totalPages <= this.#itemsCount) {
			return Array.from({ length: this.totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(this.#itemsCount / 2);
		let start = Math.max(1, this.currentPage - half);
		let end = Math.min(this.totalPages, start + this.#itemsCount - 1);

		if (end === this.totalPages) {
			start = Math.max(1, end - this.#itemsCount + 1);
		} else if (start === 1) {
			end = Math.min(this.totalPages, this.#itemsCount);
		}

		if (this.showLeftEllipsis) start++;
		if (this.showRightEllipsis) end--;

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	});

	constructor(props: UsePaginationProps) {
		this.currentPage = props.currentPage;
		this.#itemsCount = props.paginationItemsToDisplay;
		this.totalPages = props.totalPages;
	}

	setPage(newPage: number) {
		if (newPage >= 1 && newPage <= this.totalPages) {
			this.currentPage = newPage;
		}
	}

	updateTotalPages(count: number) {
		if (count >= 1) {
			this.totalPages = count;
			if (this.currentPage > count) {
				this.currentPage = count;
			}
		}
	}
}

export function usePagination(options: UsePaginationProps) {
	return new Pagination(options);
}

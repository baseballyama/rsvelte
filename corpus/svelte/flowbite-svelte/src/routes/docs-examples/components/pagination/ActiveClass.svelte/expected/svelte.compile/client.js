import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "flowbite-svelte";

export default function ActiveClass($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	PaginationNav($$anchor, {
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange,
		classes: {
			active: "bg-green-100 dark:bg-green-700 text-green-600 dark:text-white"
		}
	});
}
import * as $ from 'svelte/internal/server';
import { PaginationNav } from "flowbite-svelte";

export default function ActiveClass($$renderer) {
	let currentPage = 1;
	const totalPages = 20;

	function handlePageChange(page) {
		currentPage = page;

		// Additional logic here
		console.log("Page changed to:", page);
	}

	PaginationNav($$renderer, {
		currentPage,
		totalPages,
		onPageChange: handlePageChange,
		classes: {
			active: "bg-green-100 dark:bg-green-700 text-green-600 dark:text-white"
		}
	});
}
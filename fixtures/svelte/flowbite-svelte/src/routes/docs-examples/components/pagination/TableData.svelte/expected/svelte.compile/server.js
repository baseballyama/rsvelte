import * as $ from 'svelte/internal/server';
import { PaginationNav } from "flowbite-svelte";

export default function TableData($$renderer) {
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
		layout: 'table'
	});

	$$renderer.push(`<!----> `);

	PaginationNav($$renderer, {
		size: 'large',
		currentPage,
		totalPages,
		onPageChange: handlePageChange,
		layout: 'table'
	});

	$$renderer.push(`<!---->`);
}
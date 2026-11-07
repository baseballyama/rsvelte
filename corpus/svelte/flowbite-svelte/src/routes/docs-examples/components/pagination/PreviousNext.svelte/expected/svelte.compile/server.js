import * as $ from 'svelte/internal/server';
import { PaginationNav, P } from "flowbite-svelte";

export default function PreviousNext($$renderer) {
	let currentPage = 1;
	const totalPages = 20;

	function handlePageChange(page) {
		currentPage = page;

		// Additional logic here
		console.log("Page changed to:", page);
	}

	P($$renderer, {
		class: 'text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Showing ${$.escape(currentPage)} of 20 Entries`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PaginationNav($$renderer, {
		currentPage,
		totalPages,
		onPageChange: handlePageChange,
		layout: 'navigation'
	});

	$$renderer.push(`<!----> `);

	PaginationNav($$renderer, {
		size: 'large',
		currentPage,
		totalPages,
		onPageChange: handlePageChange,
		layout: 'navigation'
	});

	$$renderer.push(`<!---->`);
}
import * as $ from 'svelte/internal/server';
import { PaginationNav } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function TableDataIcons($$renderer) {
	let currentPage = 1;
	const totalPages = 20;

	function handlePageChange(page) {
		currentPage = page;

		// Additional logic here
		console.log("Page changed to:", page);
	}

	{
		function prevContent($$renderer) {
			ArrowLeftOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> Previous`);
		}

		function nextContent($$renderer) {
			$$renderer.push(`<!---->Next `);
			ArrowRightOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		PaginationNav($$renderer, {
			currentPage,
			totalPages,
			onPageChange: handlePageChange,
			layout: 'table',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}
}
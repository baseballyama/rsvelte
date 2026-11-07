import * as $ from 'svelte/internal/server';
import { PaginationNav } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	let currentPage = 1;
	const totalPages = 20;

	function handlePageChange(page) {
		currentPage = page;

		// Additional logic here
		console.log("Page changed to:", page);
	}

	{
		function prevContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Previous</span> `);
			ArrowLeftOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		function nextContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Next</span> `);
			ArrowRightOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		PaginationNav($$renderer, {
			currentPage,
			totalPages,
			onPageChange: handlePageChange,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function prevContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Previous</span> `);
			ArrowLeftOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		function nextContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Next</span> `);
			ArrowRightOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		PaginationNav($$renderer, {
			visiblePages: 7,
			currentPage,
			totalPages,
			onPageChange: handlePageChange,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!---->`);
}
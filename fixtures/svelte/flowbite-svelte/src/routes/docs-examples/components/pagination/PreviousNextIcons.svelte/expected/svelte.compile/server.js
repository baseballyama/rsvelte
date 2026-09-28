import * as $ from 'svelte/internal/server';
import { PaginationNav, P } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function PreviousNextIcons($$renderer) {
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
			layout: 'navigation',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!----> `);

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
			size: 'large',
			currentPage,
			totalPages,
			onPageChange: handlePageChange,
			layout: 'navigation',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!---->`);
}
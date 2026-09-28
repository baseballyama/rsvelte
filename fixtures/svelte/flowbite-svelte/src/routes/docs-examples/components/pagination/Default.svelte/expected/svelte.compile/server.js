import * as $ from 'svelte/internal/server';
import { PaginationNav } from "flowbite-svelte";
import { onMount } from "svelte";

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentPage = 1;
		let isMobile = false;
		const totalPages = 20;

		function handlePageChange(page) {
			currentPage = page;

			// Additional logic here
			console.log("Page changed to:", page);
		}

		function checkMobile() {
			isMobile = window.innerWidth <= 640;
		}

		onMount(() => {
			checkMobile();
			window.addEventListener("resize", checkMobile);

			return () => window.removeEventListener("resize", checkMobile);
		});

		PaginationNav($$renderer, { currentPage, totalPages, onPageChange: handlePageChange });
		$$renderer.push(`<!----> `);

		if (!isMobile) {
			$$renderer.push('<!--[0-->');

			PaginationNav($$renderer, {
				currentPage,
				totalPages,
				visiblePages: 7,
				onPageChange: handlePageChange
			});

			$$renderer.push(`<!----> `);

			PaginationNav($$renderer, {
				currentPage,
				totalPages,
				onPageChange: handlePageChange,
				size: 'large'
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
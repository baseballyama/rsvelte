import * as $ from 'svelte/internal/server';
import { Pagination } from "flowbite-svelte";
import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

export default function Icons2($$renderer) {
	let pages = [
		{
			name: "1",
			href: "/docs/components/pagination?page=1",
			active: false
		},

		{
			name: "2",
			href: "/docs/components/pagination?page=2",
			active: false
		},

		{
			name: "3",
			href: "/docs/components/pagination?page=3",
			active: false
		},

		{
			name: "4",
			href: "/docs/components/pagination?page=4",
			active: false
		},

		{
			name: "5",
			href: "/docs/components/pagination?page=5",
			active: false
		}
	];

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	$$renderer.push(`<div class="flex flex-col items-center justify-center gap-3">`);

	{
		function prevContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Previous</span> `);
			ChevronLeftOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		function nextContent($$renderer) {
			$$renderer.push(`<span class="sr-only">Next</span> `);
			ChevronRightOutline($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!---->`);
		}

		Pagination($$renderer, {
			pages,
			previous,
			next,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}
import * as $ from 'svelte/internal/server';
import { Pagination } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function TableDataIcons2($$renderer) {
	let helper = { start: 1, end: 10, total: 100 };

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	$$renderer.push(`<div class="flex flex-col items-center justify-center gap-3"><div class="flex flex-col items-center justify-center gap-2"><div class="text-sm text-gray-700 dark:text-gray-400">Showing <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.start)}</span> to <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.end)}</span> of <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.total)}</span> Entries</div> `);

	{
		function prevContent($$renderer) {
			$$renderer.push(`<div class="flex items-center gap-2 bg-gray-800 text-white">`);
			ArrowLeftOutline($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!----> Prev</div>`);
		}

		function nextContent($$renderer) {
			$$renderer.push(`<div class="flex items-center gap-2 bg-gray-800 text-white">Next `);
			ArrowRightOutline($$renderer, { class: 'ms-2 h-5 w-5' });
			$$renderer.push(`<!----></div>`);
		}

		Pagination($$renderer, {
			table: true,
			previous,
			next,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$$renderer.push(`<!----></div></div>`);
}
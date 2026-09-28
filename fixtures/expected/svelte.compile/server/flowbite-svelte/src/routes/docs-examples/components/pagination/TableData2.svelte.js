import * as $ from 'svelte/internal/server';
import { Pagination } from "flowbite-svelte";

export default function TableData2($$renderer) {
	let helper = { start: 1, end: 10, total: 100 };

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	$$renderer.push(`<div class="flex flex-col items-center justify-center gap-3"><div class="flex flex-col items-center justify-center gap-2"><div class="text-sm text-gray-700 dark:text-gray-400">Showing <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.start)}</span> to <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.end)}</span> of <span class="font-semibold text-gray-900 dark:text-white">${$.escape(helper.total)}</span> Entries</div> `);
	Pagination($$renderer, { table: true, previous, next });
	$$renderer.push(`<!----> `);
	Pagination($$renderer, { table: true, size: 'large', previous, next });
	$$renderer.push(`<!----></div></div>`);
}
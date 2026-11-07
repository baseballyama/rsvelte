import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Previous`, 1);
var root_1 = $.from_html(`Next <!>`, 1);

export default function TableDataIcons($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	{
		const prevContent = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ArrowLeftOutline(node, { class: 'h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_1);
		};

		const nextContent = ($$anchor) => {
			$.next();

			var fragment_2 = root_1();
			var node_1 = $.sibling($.first_child(fragment_2));

			ArrowRightOutline(node_1, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_2);
		};

		PaginationNav($$anchor, {
			get currentPage() {
				return $.get(currentPage);
			},
			totalPages,
			onPageChange: handlePageChange,
			layout: 'table',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}
}
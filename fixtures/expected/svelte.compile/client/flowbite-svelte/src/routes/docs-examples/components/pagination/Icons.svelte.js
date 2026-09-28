import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="sr-only">Previous</span> <!>`, 1);
var root_1 = $.from_html(`<span class="sr-only">Next</span> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Icons($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const prevContent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			ArrowLeftOutline(node_1, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_1);
		};

		const nextContent = ($$anchor) => {
			var fragment_2 = root_1();
			var node_2 = $.sibling($.first_child(fragment_2), 2);

			ArrowRightOutline(node_2, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_2);
		};

		PaginationNav(node, {
			get currentPage() {
				return $.get(currentPage);
			},
			totalPages,
			onPageChange: handlePageChange,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		const prevContent = ($$anchor) => {
			var fragment_3 = root();
			var node_4 = $.sibling($.first_child(fragment_3), 2);

			ArrowLeftOutline(node_4, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_3);
		};

		const nextContent = ($$anchor) => {
			var fragment_4 = root_1();
			var node_5 = $.sibling($.first_child(fragment_4), 2);

			ArrowRightOutline(node_5, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_4);
		};

		PaginationNav(node_3, {
			visiblePages: 7,
			get currentPage() {
				return $.get(currentPage);
			},
			totalPages,
			onPageChange: handlePageChange,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function PreviousNext($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Showing ${$.get(currentPage) ?? ''} of 20 Entries`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	PaginationNav(node_1, {
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange,
		layout: 'navigation'
	});

	var node_2 = $.sibling(node_1, 2);

	PaginationNav(node_2, {
		size: 'large',
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange,
		layout: 'navigation'
	});

	$.append($$anchor, fragment);
}
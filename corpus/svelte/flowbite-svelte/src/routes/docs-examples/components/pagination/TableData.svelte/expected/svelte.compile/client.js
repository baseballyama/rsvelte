import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TableData($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	PaginationNav(node, {
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange,
		layout: 'table'
	});

	var node_1 = $.sibling(node, 2);

	PaginationNav(node_1, {
		size: 'large',
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange,
		layout: 'table'
	});

	$.append($$anchor, fragment);
}
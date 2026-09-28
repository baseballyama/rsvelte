import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "flowbite-svelte";
import { onMount } from "svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	let currentPage = $.state(1);
	let isMobile = $.state(false);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	function checkMobile() {
		$.set(isMobile, window.innerWidth <= 640);
	}

	onMount(() => {
		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	PaginationNav(node, {
		get currentPage() {
			return $.get(currentPage);
		},
		totalPages,
		onPageChange: handlePageChange
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			PaginationNav(node_2, {
				get currentPage() {
					return $.get(currentPage);
				},
				totalPages,
				visiblePages: 7,
				onPageChange: handlePageChange
			});

			var node_3 = $.sibling(node_2, 2);

			PaginationNav(node_3, {
				get currentPage() {
					return $.get(currentPage);
				},
				totalPages,
				onPageChange: handlePageChange,
				size: 'large'
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(isMobile)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
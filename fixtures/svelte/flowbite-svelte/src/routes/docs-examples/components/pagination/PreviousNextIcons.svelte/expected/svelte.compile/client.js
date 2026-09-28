import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav, P } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Previous`, 1);
var root_1 = $.from_html(`Next <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function PreviousNextIcons($$anchor) {
	let currentPage = $.state(1);
	const totalPages = 20;

	function handlePageChange(page) {
		$.set(currentPage, page, true);

		// Additional logic here
		console.log("Page changed to:", page);
	}

	var fragment = root_2();
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

	{
		const prevContent = ($$anchor) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			ArrowLeftOutline(node_2, { class: 'h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_2);
		};

		const nextContent = ($$anchor) => {
			$.next();

			var fragment_3 = root_1();
			var node_3 = $.sibling($.first_child(fragment_3));

			ArrowRightOutline(node_3, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_3);
		};

		PaginationNav(node_1, {
			get currentPage() {
				return $.get(currentPage);
			},
			totalPages,
			onPageChange: handlePageChange,
			layout: 'navigation',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	var node_4 = $.sibling(node_1, 2);

	{
		const prevContent = ($$anchor) => {
			var fragment_4 = root();
			var node_5 = $.first_child(fragment_4);

			ArrowLeftOutline(node_5, { class: 'h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_4);
		};

		const nextContent = ($$anchor) => {
			$.next();

			var fragment_5 = root_1();
			var node_6 = $.sibling($.first_child(fragment_5));

			ArrowRightOutline(node_6, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_5);
		};

		PaginationNav(node_4, {
			size: 'large',
			get currentPage() {
				return $.get(currentPage);
			},
			totalPages,
			onPageChange: handlePageChange,
			layout: 'navigation',
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$.append($$anchor, fragment);
}
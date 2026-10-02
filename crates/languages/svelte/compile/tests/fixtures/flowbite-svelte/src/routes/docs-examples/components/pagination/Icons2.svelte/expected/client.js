import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from "flowbite-svelte";
import { ChevronLeftOutline, ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="sr-only">Previous</span> <!>`, 1);
var root_1 = $.from_html(`<span class="sr-only">Next</span> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center justify-center gap-3"><!></div>`);

export default function Icons2($$anchor) {
	let pages = $.proxy([
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
	]);

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	var div = root_2();
	var node = $.child(div);

	{
		const prevContent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment), 2);

			ChevronLeftOutline(node_1, { class: 'h-5 w-5' });
			$.append($$anchor, fragment);
		};

		const nextContent = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			ChevronRightOutline(node_2, { class: 'h-5 w-5' });
			$.append($$anchor, fragment_1);
		};

		Pagination(node, {
			get pages() {
				return pages;
			},
			previous,
			next,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}
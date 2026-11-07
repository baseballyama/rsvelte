import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex items-center gap-2 bg-gray-800 text-white"><!> Prev</div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2 bg-gray-800 text-white">Next <!></div>`);
var root_2 = $.from_html(`<div class="flex flex-col items-center justify-center gap-3"><div class="flex flex-col items-center justify-center gap-2"><div class="text-sm text-gray-700 dark:text-gray-400">Showing <span class="font-semibold text-gray-900 dark:text-white"> </span> to <span class="font-semibold text-gray-900 dark:text-white"> </span> of <span class="font-semibold text-gray-900 dark:text-white"> </span> Entries</div> <!></div></div>`);

export default function TableDataIcons2($$anchor) {
	let helper = { start: 1, end: 10, total: 100 };

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var span = $.sibling($.child(div_2));
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);
	var text_2 = $.only_child(span_2, true);

	$.next();
	$.reset(div_2);

	var node = $.sibling(div_2, 2);

	{
		const prevContent = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			ArrowLeftOutline(node_1, { class: 'me-2 h-5 w-5' });
			$.next();
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		const nextContent = ($$anchor) => {
			var div_4 = root_1();
			var node_2 = $.sibling($.child(div_4));

			ArrowRightOutline(node_2, { class: 'ms-2 h-5 w-5' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		Pagination(node, {
			table: true,
			previous,
			next,
			prevContent,
			nextContent,
			$$slots: { prevContent: true, nextContent: true }
		});
	}

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, helper.start);
		$.set_text(text_1, helper.end);
		$.set_text(text_2, helper.total);
	});

	$.append($$anchor, div);
}
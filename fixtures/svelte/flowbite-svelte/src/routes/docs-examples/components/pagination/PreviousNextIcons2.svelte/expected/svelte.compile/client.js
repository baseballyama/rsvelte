import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationItem } from "flowbite-svelte";
import { ArrowLeftOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Previous`, 1);
var root_1 = $.from_html(`Next <!>`, 1);
var root_2 = $.from_html(`<div class="flex space-x-3 rtl:space-x-reverse"><!> <!></div> <div class="flex space-x-3 rtl:space-x-reverse"><!> <!></div>`, 1);

export default function PreviousNextIcons2($$anchor) {
	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	PaginationItem(node, {
		class: 'flex items-center',
		onclick: previous,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ArrowLeftOutline(node_1, { class: 'me-2 h-3.5 w-3.5' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	PaginationItem(node_2, {
		class: 'flex items-center',
		onclick: next,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_2 = root_1();
			var node_3 = $.sibling($.first_child(fragment_2));

			ArrowRightOutline(node_3, { class: 'ms-2 h-3.5 w-3.5' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	PaginationItem(node_4, {
		size: 'large',
		class: 'flex items-center',
		onclick: previous,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_5 = $.first_child(fragment_3);

			ArrowLeftOutline(node_5, { class: 'me-2 h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	PaginationItem(node_6, {
		size: 'large',
		class: 'flex items-center',
		onclick: next,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_4 = root_1();
			var node_7 = $.sibling($.first_child(fragment_4));

			ArrowRightOutline(node_7, { class: 'ms-2 h-5 w-5' });
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}
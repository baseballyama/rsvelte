import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationItem } from "flowbite-svelte";

var root = $.from_html(`<div class="flex space-x-3 rtl:space-x-reverse"><!> <!></div> <div class="flex space-x-3 rtl:space-x-reverse"><!> <!></div>`, 1);

export default function PreviousNext2($$anchor) {
	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	PaginationItem(node, {
		onclick: previous,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Previous');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	PaginationItem(node_1, {
		onclick: next,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Next');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	PaginationItem(node_2, {
		size: 'large',
		onclick: previous,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Previous');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	PaginationItem(node_3, {
		size: 'large',
		onclick: next,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Next');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}
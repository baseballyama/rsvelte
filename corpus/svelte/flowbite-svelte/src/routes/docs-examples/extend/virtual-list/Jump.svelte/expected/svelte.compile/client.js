import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="h-[40px] border-b p-2 leading-[40px] text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"> </div>`);
var root_1 = $.from_html(`<div class="space-y-4"><!> <!> <!></div>`);

export default function Jump($$anchor) {
	const items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);
	let scrollToFn;

	function jumpToItem(index) {
		scrollToFn?.(index);
	}

	var div = root_1();
	var node = $.child(div);

	Button(node, {
		onclick: () => jumpToItem(2499),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Jump to item 2500');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => jumpToItem(0),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Jump to top item');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, item = $.noop, index = $.noop) => {
			var div_1 = root();
			var text_2 = $.only_child(div_1);

			$.template_effect(() => $.set_text(text_2, `${index() + 1}: ${item() ?? ''}`));
			$.append($$anchor, div_1);
		};

		VirtualList(node_2, {
			get items() {
				return items;
			},
			minItemHeight: 40,
			height: 400,
			scrollToIndex: (fn) => scrollToFn = fn,
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}
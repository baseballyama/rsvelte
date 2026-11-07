import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from "flowbite-svelte";

var root = $.from_html(`<div class="border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800"><div class="font-semibold text-gray-900 dark:text-white"> </div> <div class="mt-1 text-sm text-gray-600 dark:text-gray-400"> </div> <div class="mt-1 text-xs text-gray-500"> </div></div>`);

export default function VariableHeights($$anchor) {
	const items = Array.from({ length: 1000 }, (_, i) => {
		const types = ["small", "medium", "large"];
		const type = types[i % 3];

		return {
			title: `Item ${i + 1}`,
			description: type === "small"
				? "Short description"
				: type === "medium"
					? "Medium length description with more details about this item"
					: "Large description with lots of content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. This item has much more information to display and takes up more vertical space.",
			type
		};
	});

	function getItemHeight(item) {
		const typedItem = item;

		return typedItem.type === "small" ? 100 : typedItem.type === "medium" ? 90 : 130;
	}

	{
		const children = ($$anchor, item = $.noop, _index = $.noop) => {
			const typedItem = $.derived(item);
			var div = root();
			var div_1 = $.child(div);
			var text = $.only_child(div_1, true);
			var div_2 = $.sibling(div_1, 2);
			var text_1 = $.only_child(div_2, true);
			var div_3 = $.sibling(div_2, 2);
			var text_2 = $.only_child(div_3);

			$.reset(div);

			$.template_effect(
				($0, $1) => {
					$.set_style(div, `height:${$0 ?? ''}px`);
					$.set_text(text, $.get(typedItem).title);
					$.set_text(text_1, $.get(typedItem).description);
					$.set_text(text_2, `Height: ${$1 ?? ''}px`);
				},
				[
					() => getItemHeight($.get(typedItem)),
					() => getItemHeight($.get(typedItem))
				]
			);

			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return items;
			},
			minItemHeight: 100,
			getItemHeight,
			height: 400,
			children,
			$$slots: { default: true }
		});
	}
}
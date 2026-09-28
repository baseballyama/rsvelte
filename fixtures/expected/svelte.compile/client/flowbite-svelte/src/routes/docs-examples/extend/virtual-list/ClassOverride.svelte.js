import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from "flowbite-svelte";

var root = $.from_html(`<div class="p-3 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"> </div>`);

export default function ClassOverride($$anchor) {
	const items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);

	{
		const children = ($$anchor, item = $.noop, index = $.noop) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => $.set_text(text, `${index() + 1}: ${item() ?? ''}`));
			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return items;
			},
			classes: { item: "[contain:layout_style_paint] h-12" },
			children,
			$$slots: { default: true }
		});
	}
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from "flowbite-svelte";

var root = $.from_html(`<div style="height:70px"><div class="flex-1"><div class="font-medium text-gray-900 dark:text-white"> </div> <div class="text-sm text-gray-500 dark:text-gray-400"> </div></div> <span> </span></div>`);

export default function CustomStyling($$anchor) {
	const items = Array.from({ length: 2000 }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		email: `user${i + 1}@example.com`,
		status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "inactive"
	}));

	{
		const children = ($$anchor, item = $.noop, index = $.noop) => {
			const user = $.derived(item);
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var text = $.only_child(div_2, true);
			var div_3 = $.sibling(div_2, 2);
			var text_1 = $.only_child(div_3, true);

			$.reset(div_1);

			var span = $.sibling(div_1, 2);
			var text_2 = $.only_child(span, true);

			$.reset(div);

			$.template_effect(() => {
				$.set_class(div, 1, `flex items-center justify-between border-b p-4 transition-colors
             ${index() % 2 === 0
					? 'bg-white dark:bg-gray-900'
					: 'bg-gray-50 dark:bg-gray-800'}
             hover:bg-blue-50 dark:hover:bg-blue-900/20`);

				$.set_text(text, $.get(user).name);
				$.set_text(text_1, $.get(user).email);

				$.set_class(span, 1, `rounded-full px-3 py-1 text-xs font-semibold
               ${$.get(user).status === 'active'
					? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
					: $.get(user).status === 'pending'
						? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
						: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`);

				$.set_text(text_2, $.get(user).status);
			});

			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return items;
			},
			minItemHeight: 70,
			height: 400,
			class: 'rounded-lg border',
			children,
			$$slots: { default: true }
		});
	}
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList, Button, Spinner } from "flowbite-svelte";

var root = $.from_html(`<!> Loading...`, 1);
var root_1 = $.from_html(`<div class="rounded-lg border p-8 text-center text-gray-500 dark:text-gray-400" style="height:400px"><div class="mb-4 text-6xl">📋</div> <p class="text-lg font-medium">No items yet</p> <p class="text-sm">Click the button above to load items</p></div>`);
var root_2 = $.from_html(`<div class="flex items-center justify-center rounded-lg border p-8" style="height:400px"><div class="text-center"><!> <p class="mt-4 text-gray-600 dark:text-gray-400">Loading items...</p></div></div>`);
var root_3 = $.from_html(`<div class="border-b p-2 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"> </div>`);
var root_4 = $.from_html(`<div class="space-y-4"><!> <!></div>`);

export default function LoadingState($$anchor, $$props) {
	$.push($$props, true);

	let items = $.state($.proxy([]));
	let isLoading = $.state(false);

	async function loadItems() {
		$.set(isLoading, true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		$.set(items, Array.from({ length: 3000 }, (_, i) => `Item ${i + 1}`), true);
		$.set(isLoading, false);
	}

	var div = root_4();
	var node = $.child(div);

	Button(node, {
		onclick: loadItems,
		get disabled() {
			return $.get(isLoading);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Spinner(node_2, { class: 'mr-2', size: '4' });
					$.next();
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var text = $.text('Load Items');

					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isLoading)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var div_3 = $.child(div_2);
			var node_4 = $.child(div_3);

			Spinner(node_4, { size: '12' });
			$.next(2);
			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate_1 = ($$anchor) => {
			{
				const children = ($$anchor, item = $.noop, index = $.noop) => {
					var div_4 = root_3();
					var text_1 = $.only_child(div_4);

					$.template_effect(() => $.set_text(text_1, `${index() + 1}: ${item() ?? ''}`));
					$.append($$anchor, div_4);
				};

				VirtualList($$anchor, {
					get items() {
						return $.get(items);
					},
					minItemHeight: 40,
					height: 400,
					class: 'rounded-lg border',
					children,
					$$slots: { default: true }
				});
			}
		};

		$.if(node_3, ($$render) => {
			if ($.get(items).length === 0 && !$.get(isLoading)) $$render(consequent_1); else if ($.get(isLoading)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
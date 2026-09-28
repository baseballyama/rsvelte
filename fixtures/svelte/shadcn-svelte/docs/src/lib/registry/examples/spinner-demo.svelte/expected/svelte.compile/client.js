import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<span class="text-sm tabular-nums">$100.00</span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]"><!></div>`);

export default function Spinner_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			variant: 'muted',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Item.Media, ($$anchor, Item_Media) => {
					Item_Media($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									class: 'line-clamp-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Processing payment...');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Item.Content, ($$anchor, Item_Content_1) => {
					Item_Content_1($$anchor, {
						class: 'flex-none justify-end',
						children: ($$anchor, $$slotProps) => {
							var span = root();

							$.append($$anchor, span);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}
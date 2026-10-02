import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<h3><!></h3> <!>`, 1);

export default function Controlled($$anchor) {
	let value = $.state($.proxy(['1']));

	Accordion($$anchor, {
		get value() {
			return $.get(value);
		},
		onValueChange: (details) => $.set(value, details.value, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => ['1', '2', '3'], (item) => item, ($$anchor, item) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Accordion.Item, ($$anchor, Accordion_Item) => {
					Accordion_Item($$anchor, {
						get value() {
							return item;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var h3 = $.first_child(fragment_3);
							var node_2 = $.child(h3);

							$.component(node_2, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
								Accordion_ItemTrigger($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, `Item ${item ?? ''}`));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h3);

							var node_3 = $.sibling(h3, 2);

							$.component(node_3, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
								Accordion_ItemContent($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `Content for item ${item ?? ''}`));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
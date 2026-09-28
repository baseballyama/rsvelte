import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<h3><!></h3> <!>`, 1);

export default function Indicator($$anchor) {
	Accordion($$anchor, {
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
							var fragment_3 = root_2();
							var h3 = $.first_child(fragment_3);
							var node_2 = $.child(h3);

							$.component(node_2, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
								Accordion_ItemTrigger($$anchor, {
									class: 'flex justify-between items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_1();
										var text = $.first_child(fragment_4);
										var node_3 = $.sibling(text);

										$.component(node_3, () => Accordion.ItemIndicator, ($$anchor, Accordion_ItemIndicator) => {
											Accordion_ItemIndicator($$anchor, {
												class: 'group',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_4 = $.first_child(fragment_5);

													MinusIcon(node_4, { class: 'size-4 group-data-[state=open]:block hidden' });

													var node_5 = $.sibling(node_4, 2);

													PlusIcon(node_5, { class: 'size-4 group-data-[state=open]:hidden block' });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.template_effect(() => $.set_text(text, `Item ${item ?? ''} `));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h3);

							var node_6 = $.sibling(h3, 2);

							$.component(node_6, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
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
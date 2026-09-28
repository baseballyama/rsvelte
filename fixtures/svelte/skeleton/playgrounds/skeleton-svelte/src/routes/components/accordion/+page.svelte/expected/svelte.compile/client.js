import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<h3><!></h3> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Item, ($$anchor, Accordion_Item) => {
				Accordion_Item($$anchor, {
					value: 'item-1',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var h3 = $.first_child(fragment_2);
						var node_1 = $.child(h3);

						$.component(node_1, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
							Accordion_ItemTrigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Item 1');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.reset(h3);

						var node_2 = $.sibling(h3, 2);

						$.component(node_2, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
							Accordion_ItemContent($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Content 1');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
				Accordion_Item_1($$anchor, {
					value: 'item-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var h3_1 = $.first_child(fragment_3);
						var node_4 = $.child(h3_1);

						$.component(node_4, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger_1) => {
							Accordion_ItemTrigger_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Item 2');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.reset(h3_1);

						var node_5 = $.sibling(h3_1, 2);

						$.component(node_5, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent_1) => {
							Accordion_ItemContent_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Content 2');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_3, 2);

			$.component(node_6, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
				Accordion_Item_2($$anchor, {
					value: 'item-3',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var h3_2 = $.first_child(fragment_4);
						var node_7 = $.child(h3_2);

						$.component(node_7, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger_2) => {
							Accordion_ItemTrigger_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Item 3');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(h3_2);

						var node_8 = $.sibling(h3_2, 2);

						$.component(node_8, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent_2) => {
							Accordion_ItemContent_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Content 3');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_1($$anchor) {
	Accordion($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Item, ($$anchor, Accordion_Item) => {
				Accordion_Item($$anchor, {
					value: 'item',
					'data-testid': 'item',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Accordion.ItemTrigger, ($$anchor, Accordion_ItemTrigger) => {
							Accordion_ItemTrigger($$anchor, {
								'data-testid': 'item-trigger',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Accordion.ItemIndicator, ($$anchor, Accordion_ItemIndicator) => {
										Accordion_ItemIndicator($$anchor, { 'data-testid': 'item-indicator' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Accordion.ItemContent, ($$anchor, Accordion_ItemContent) => {
							Accordion_ItemContent($$anchor, { 'data-testid': 'item-content' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
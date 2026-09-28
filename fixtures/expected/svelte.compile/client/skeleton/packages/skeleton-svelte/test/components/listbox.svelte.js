import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listbox, useListCollection } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Listbox_1($$anchor, $$props) {
	$.push($$props, true);

	const collection = $.derived(() => useListCollection({ items: [{ value: 'item', label: 'Item' }] }));

	Listbox($$anchor, {
		get collection() {
			return $.get(collection);
		},
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Listbox.Label, ($$anchor, Listbox_Label) => {
				Listbox_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Listbox.Input, ($$anchor, Listbox_Input) => {
				Listbox_Input($$anchor, { 'data-testid': 'input' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Listbox.Content, ($$anchor, Listbox_Content) => {
				Listbox_Content($$anchor, {
					'data-testid': 'content',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => Listbox.ItemGroup, ($$anchor, Listbox_ItemGroup) => {
							Listbox_ItemGroup($$anchor, {
								'data-testid': 'item-group',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Listbox.ItemGroupLabel, ($$anchor, Listbox_ItemGroupLabel) => {
										Listbox_ItemGroupLabel($$anchor, { 'data-testid': 'item-group-label' });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Listbox.Item, ($$anchor, Listbox_Item) => {
										Listbox_Item($$anchor, {
											item: 'item',
											'data-testid': 'item',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => Listbox.ItemText, ($$anchor, Listbox_ItemText) => {
													Listbox_ItemText($$anchor, {
														'data-testid': 'item-text',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Item');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Listbox.ItemIndicator, ($$anchor, Listbox_ItemIndicator) => {
													Listbox_ItemIndicator($$anchor, { 'data-testid': 'item-indicator' });
												});

												$.append($$anchor, fragment_4);
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
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
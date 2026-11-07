import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Combobox_1($$anchor) {
	Combobox($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Combobox.Label, ($$anchor, Combobox_Label) => {
				Combobox_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Combobox.Control, ($$anchor, Combobox_Control) => {
				Combobox_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Combobox.Input, ($$anchor, Combobox_Input) => {
							Combobox_Input($$anchor, { 'data-testid': 'input' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
							Combobox_Trigger($$anchor, { 'data-testid': 'trigger' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Combobox.ClearTrigger, ($$anchor, Combobox_ClearTrigger) => {
							Combobox_ClearTrigger($$anchor, { 'data-testid': 'clear-trigger' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => Combobox.Positioner, ($$anchor, Combobox_Positioner) => {
				Combobox_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => Combobox.Content, ($$anchor, Combobox_Content) => {
							Combobox_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => Combobox.ItemGroup, ($$anchor, Combobox_ItemGroup) => {
										Combobox_ItemGroup($$anchor, {
											'data-testid': 'item-group',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_8 = $.first_child(fragment_5);

												$.component(node_8, () => Combobox.ItemGroupLabel, ($$anchor, Combobox_ItemGroupLabel) => {
													Combobox_ItemGroupLabel($$anchor, { 'data-testid': 'item-group-label' });
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Combobox.Item, ($$anchor, Combobox_Item) => {
													Combobox_Item($$anchor, {
														item: 'item',
														'data-testid': 'item',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_10 = $.first_child(fragment_6);

															$.component(node_10, () => Combobox.ItemText, ($$anchor, Combobox_ItemText) => {
																Combobox_ItemText($$anchor, {
																	'data-testid': 'item-text',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Item');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_11 = $.sibling(node_10, 2);

															$.component(node_11, () => Combobox.ItemIndicator, ($$anchor, Combobox_ItemIndicator) => {
																Combobox_ItemIndicator($$anchor, { 'data-testid': 'item-indicator' });
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
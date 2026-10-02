import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menu } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Menu_1($$anchor) {
	Menu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					'data-testid': 'trigger',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Menu.Indicator, ($$anchor, Menu_Indicator) => {
							Menu_Indicator($$anchor, { 'data-testid': 'indicator' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Menu.ContextTrigger, ($$anchor, Menu_ContextTrigger) => {
				Menu_ContextTrigger($$anchor, {
					'data-testid': 'context-trigger',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Menu.Indicator, ($$anchor, Menu_Indicator_1) => {
							Menu_Indicator_1($$anchor, { 'data-testid': 'indicator' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_2, 2);

			$.component(node_4, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
				Menu_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_5 = $.first_child(fragment_4);

						$.component(node_5, () => Menu.Content, ($$anchor, Menu_Content) => {
							Menu_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => Menu.ItemGroup, ($$anchor, Menu_ItemGroup) => {
										Menu_ItemGroup($$anchor, {
											'data-testid': 'item-group',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel) => {
													Menu_ItemGroupLabel($$anchor, { 'data-testid': 'item-group-label' });
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Menu.Item, ($$anchor, Menu_Item) => {
													Menu_Item($$anchor, {
														value: 'item',
														'data-testid': 'item',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_9 = $.first_child(fragment_7);

															$.component(node_9, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
																Menu_ItemText($$anchor, { 'data-testid': 'item-text' });
															});

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator) => {
																Menu_ItemIndicator($$anchor, { 'data-testid': 'item-indicator' });
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_8, 2);

												$.component(node_11, () => Menu.OptionItem, ($$anchor, Menu_OptionItem) => {
													Menu_OptionItem($$anchor, {
														value: 'option-item',
														'data-testid': 'option-item',
														type: 'checkbox',
														checked: false,
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_12 = $.first_child(fragment_8);

															$.component(node_12, () => Menu.ItemText, ($$anchor, Menu_ItemText_1) => {
																Menu_ItemText_1($$anchor, { 'data-testid': 'item-text' });
															});

															var node_13 = $.sibling(node_12, 2);

															$.component(node_13, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator_1) => {
																Menu_ItemIndicator_1($$anchor, { 'data-testid': 'item-indicator' });
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_11, 2);

												Menu(node_14, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_15 = $.first_child(fragment_9);

														$.component(node_15, () => Menu.TriggerItem, ($$anchor, Menu_TriggerItem) => {
															Menu_TriggerItem($$anchor, {
																value: 'trigger-item',
																'data-testid': 'trigger-item',
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root();
																	var node_16 = $.first_child(fragment_10);

																	$.component(node_16, () => Menu.ItemText, ($$anchor, Menu_ItemText_2) => {
																		Menu_ItemText_2($$anchor, { 'data-testid': 'item-text' });
																	});

																	var node_17 = $.sibling(node_16, 2);

																	$.component(node_17, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator_2) => {
																		Menu_ItemIndicator_2($$anchor, { 'data-testid': 'item-indicator' });
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_6, 2);

									$.component(node_18, () => Menu.Separator, ($$anchor, Menu_Separator) => {
										Menu_Separator($$anchor, { 'data-testid': 'separator' });
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Menu.Arrow, ($$anchor, Menu_Arrow) => {
										Menu_Arrow($$anchor, {
											'data-testid': 'arrow',
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_20 = $.first_child(fragment_11);

												$.component(node_20, () => Menu.ArrowTip, ($$anchor, Menu_ArrowTip) => {
													Menu_ArrowTip($$anchor, { 'data-testid': 'arrow-tip' });
												});

												$.append($$anchor, fragment_11);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
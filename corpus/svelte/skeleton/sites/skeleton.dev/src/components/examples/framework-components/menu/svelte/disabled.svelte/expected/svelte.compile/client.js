import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
	Menu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Menu');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Menu.Item, ($$anchor, Menu_Item) => {
												Menu_Item($$anchor, {
													value: 'new',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
															Menu_ItemText($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('New File');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_4, 2);

											$.component(node_6, () => Menu.Item, ($$anchor, Menu_Item_1) => {
												Menu_Item_1($$anchor, {
													value: 'open',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_7 = $.first_child(fragment_6);

														$.component(node_7, () => Menu.ItemText, ($$anchor, Menu_ItemText_1) => {
															Menu_ItemText_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Open File');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_6, 2);

											$.component(node_8, () => Menu.Separator, ($$anchor, Menu_Separator) => {
												Menu_Separator($$anchor, {});
											});

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Menu.Item, ($$anchor, Menu_Item_2) => {
												Menu_Item_2($$anchor, {
													value: 'save',
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => Menu.ItemText, ($$anchor, Menu_ItemText_2) => {
															Menu_ItemText_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Save');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_9, 2);

											$.component(node_11, () => Menu.Item, ($$anchor, Menu_Item_3) => {
												Menu_Item_3($$anchor, {
													value: 'disabled',
													disabled: true,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = $.comment();
														var node_12 = $.first_child(fragment_8);

														$.component(node_12, () => Menu.ItemText, ($$anchor, Menu_ItemText_3) => {
															Menu_ItemText_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text('Disabled');

																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
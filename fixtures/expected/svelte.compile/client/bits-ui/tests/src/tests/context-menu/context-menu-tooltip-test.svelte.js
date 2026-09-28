import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, ContextMenu } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);

export default function Context_menu_tooltip_test($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									'data-testid': 'tooltip-trigger',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
											ContextMenu_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
														ContextMenu_Trigger($$anchor, {
															'data-testid': 'context-menu-trigger',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Right click me');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
														ContextMenu_Portal($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
																	ContextMenu_Content($$anchor, {
																		'data-testid': 'context-menu-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_7 = $.first_child(fragment_6);

																			$.component(node_7, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
																				ContextMenu_Item($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_1 = $.text('Item1');

																						$.append($$anchor, text_1);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_8 = $.sibling(node_7, 2);

																			$.component(node_8, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
																				ContextMenu_Item_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text('Item2');

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

							var node_9 = $.sibling(node_2, 2);

							$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									'data-testid': 'tooltip-content',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Tooltip content');

										$.append($$anchor, text_3);
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
	});

	$.append($$anchor, fragment);
}
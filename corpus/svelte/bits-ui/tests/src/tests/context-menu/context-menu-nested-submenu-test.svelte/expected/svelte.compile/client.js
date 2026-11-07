import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);

export default function Context_menu_nested_submenu_test($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Right click me');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
								ContextMenu_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
											ContextMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
														ContextMenu_SubTrigger($$anchor, {
															'data-testid': 'sub-trigger',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Sub');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
														ContextMenu_SubContent($$anchor, {
															'data-testid': 'sub-content',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_7 = $.first_child(fragment_5);

																$.component(node_7, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_1) => {
																	ContextMenu_Sub_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_8 = $.first_child(fragment_6);

																			$.component(node_8, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_1) => {
																				ContextMenu_SubTrigger_1($$anchor, {
																					'data-testid': 'sub-sub-trigger',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text('Sub-sub');

																						$.append($$anchor, text_2);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_9 = $.sibling(node_8, 2);

																			$.component(node_9, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_1) => {
																				ContextMenu_SubContent_1($$anchor, {
																					'data-testid': 'sub-sub-content',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_7 = $.comment();
																						var node_10 = $.first_child(fragment_7);

																						$.component(node_10, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
																							ContextMenu_Item($$anchor, {
																								'data-testid': 'sub-sub-item',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_3 = $.text('Hello');

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
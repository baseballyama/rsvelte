import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);

export default function Context_menu_nested_test($$anchor) {
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

							var text = $.text('open');

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

										$.component(node_4, () => ContextMenu.Root, ($$anchor, ContextMenu_Root_1) => {
											ContextMenu_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
																ContextMenu_Item($$anchor, $.spread_props(props, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('item');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																}));
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_1) => {
																ContextMenu_Portal_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_8 = $.first_child(fragment_6);

																		$.component(node_8, () => ContextMenu.Content, ($$anchor, ContextMenu_Content_1) => {
																			ContextMenu_Content_1($$anchor, {
																				'data-testid': 'nested-content',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = $.comment();
																					var node_9 = $.first_child(fragment_7);

																					$.component(node_9, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
																						ContextMenu_Item_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('some nested item');

																								$.append($$anchor, text_2);
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
														};

														$.component(node_5, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger_1) => {
															ContextMenu_Trigger_1($$anchor, {
																'data-testid': 'nested-trigger',
																child,
																$$slots: { child: true }
															});
														});
													}

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
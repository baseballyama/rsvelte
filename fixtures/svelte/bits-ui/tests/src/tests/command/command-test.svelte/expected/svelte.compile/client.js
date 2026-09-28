import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'separatorProps']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Command_test($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, $.spread_props(() => rest, {
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { 'data-testid': 'input', 'aria-label': 'Search' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						'data-testid': 'list',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									'data-testid': 'viewport',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												'data-testid': 'empty',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('No results found.');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
											Command_Group($$anchor, {
												'data-testid': 'group-a',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
														Command_GroupHeading($$anchor, {
															'data-testid': 'group-a-heading',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Suggestions');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
														Command_GroupItems($$anchor, {
															'data-testid': 'group-a-items',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_8 = $.first_child(fragment_5);

																$.component(node_8, () => Command.Item, ($$anchor, Command_Item) => {
																	Command_Item($$anchor, {
																		'data-testid': 'item-introduction',
																		keywords: ["getting started", "tutorial"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Introduction');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => Command.Item, ($$anchor, Command_Item_1) => {
																	Command_Item_1($$anchor, {
																		'data-testid': 'item-delegation',
																		keywords: ["child", "custom element", "snippets"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Delegation');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Command.Item, ($$anchor, Command_Item_2) => {
																	Command_Item_2($$anchor, {
																		'data-testid': 'item-styling',
																		keywords: ["css", "theme", "colors", "fonts", "tailwind"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Styling');

																			$.append($$anchor, text_4);
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

										var node_11 = $.sibling(node_5, 2);

										$.component(node_11, () => Command.Separator, ($$anchor, Command_Separator) => {
											Command_Separator($$anchor, $.spread_props({ 'data-testid': 'separator' }, () => $$props.separatorProps));
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Command.Group, ($$anchor, Command_Group_1) => {
											Command_Group_1($$anchor, {
												'data-testid': 'group-b',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_13 = $.first_child(fragment_6);

													$.component(node_13, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
														Command_GroupHeading_1($$anchor, {
															'data-testid': 'group-b-heading',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Components');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
														Command_GroupItems_1($$anchor, {
															'data-testid': 'group-b-items',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_15 = $.first_child(fragment_7);

																$.component(node_15, () => Command.Item, ($$anchor, Command_Item_3) => {
																	Command_Item_3($$anchor, {
																		'data-testid': 'item-calendar',
																		keywords: ["dates", "times"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Calendar');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_15, 2);

																$.component(node_16, () => Command.Item, ($$anchor, Command_Item_4) => {
																	Command_Item_4($$anchor, {
																		'data-testid': 'item-radio-group',
																		keywords: ["buttons", "forms"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text('Radio Group');

																			$.append($$anchor, text_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_16, 2);

																$.component(node_17, () => Command.Item, ($$anchor, Command_Item_5) => {
																	Command_Item_5($$anchor, {
																		'data-testid': 'item-combobox',
																		keywords: ["inputs", "text", "autocomplete"],
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Combobox');

																			$.append($$anchor, text_8);
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
		}));
	});

	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span>Calendar</span>`, 1);
var root_1 = $.from_html(`<!> <span>Search Emoji</span>`, 1);
var root_2 = $.from_html(`<!> <span>Calculator</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span>Profile</span> <!>`, 1);
var root_5 = $.from_html(`<!> <span>Billing</span> <!>`, 1);
var root_6 = $.from_html(`<!> <span>Settings</span> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);

export default function Command_inline($$anchor) {
	Example($$anchor, {
		title: 'Inline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'p-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_8();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Type a command or search...' });
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_7();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('No results found.');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	heading: 'Suggestions',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root_3();
																		var node_7 = $.first_child(fragment_6);

																		$.component(node_7, () => Command.Item, ($$anchor, Command_Item) => {
																			Command_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = root();
																					var node_8 = $.first_child(fragment_7);

																					IconPlaceholder(node_8, {
																						lucide: 'CalendarIcon',
																						tabler: 'IconCalendar',
																						hugeicons: 'CalendarIcon',
																						phosphor: 'CalendarBlankIcon',
																						remixicon: 'RiCalendarLine'
																					});

																					$.next(2);
																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_9 = $.sibling(node_7, 2);

																		$.component(node_9, () => Command.Item, ($$anchor, Command_Item_1) => {
																			Command_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_1();
																					var node_10 = $.first_child(fragment_8);

																					IconPlaceholder(node_10, {
																						lucide: 'SmileIcon',
																						tabler: 'IconMoodSmile',
																						hugeicons: 'SmileIcon',
																						phosphor: 'SmileyIcon',
																						remixicon: 'RiEmotionLine'
																					});

																					$.next(2);
																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_11 = $.sibling(node_9, 2);

																		$.component(node_11, () => Command.Item, ($$anchor, Command_Item_2) => {
																			Command_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root_2();
																					var node_12 = $.first_child(fragment_9);

																					IconPlaceholder(node_12, {
																						lucide: 'CalculatorIcon',
																						tabler: 'IconCalculator',
																						hugeicons: 'CalculatorIcon',
																						phosphor: 'CalculatorIcon',
																						remixicon: 'RiCalculatorLine'
																					});

																					$.next(2);
																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_6, 2);

															$.component(node_13, () => Command.Separator, ($$anchor, Command_Separator) => {
																Command_Separator($$anchor, {});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Command.Group, ($$anchor, Command_Group_1) => {
																Command_Group_1($$anchor, {
																	heading: 'Settings',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_3();
																		var node_15 = $.first_child(fragment_10);

																		$.component(node_15, () => Command.Item, ($$anchor, Command_Item_3) => {
																			Command_Item_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_4();
																					var node_16 = $.first_child(fragment_11);

																					IconPlaceholder(node_16, {
																						lucide: 'UserIcon',
																						tabler: 'IconUser',
																						hugeicons: 'UserIcon',
																						phosphor: 'UserIcon',
																						remixicon: 'RiUserLine'
																					});

																					var node_17 = $.sibling(node_16, 4);

																					$.component(node_17, () => Command.Shortcut, ($$anchor, Command_Shortcut) => {
																						Command_Shortcut($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_1 = $.text('⌘P');

																								$.append($$anchor, text_1);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_18 = $.sibling(node_15, 2);

																		$.component(node_18, () => Command.Item, ($$anchor, Command_Item_4) => {
																			Command_Item_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_5();
																					var node_19 = $.first_child(fragment_12);

																					IconPlaceholder(node_19, {
																						lucide: 'CreditCardIcon',
																						tabler: 'IconCreditCard',
																						hugeicons: 'CreditCardIcon',
																						phosphor: 'CreditCardIcon',
																						remixicon: 'RiBankCardLine'
																					});

																					var node_20 = $.sibling(node_19, 4);

																					$.component(node_20, () => Command.Shortcut, ($$anchor, Command_Shortcut_1) => {
																						Command_Shortcut_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('⌘B');

																								$.append($$anchor, text_2);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_21 = $.sibling(node_18, 2);

																		$.component(node_21, () => Command.Item, ($$anchor, Command_Item_5) => {
																			Command_Item_5($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_13 = root_6();
																					var node_22 = $.first_child(fragment_13);

																					IconPlaceholder(node_22, {
																						lucide: 'SettingsIcon',
																						tabler: 'IconSettings',
																						hugeicons: 'SettingsIcon',
																						phosphor: 'GearIcon',
																						remixicon: 'RiSettingsLine'
																					});

																					var node_23 = $.sibling(node_22, 4);

																					$.component(node_23, () => Command.Shortcut, ($$anchor, Command_Shortcut_2) => {
																						Command_Shortcut_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_3 = $.text('⌘S');

																								$.append($$anchor, text_3);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_10);
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
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
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
var root_9 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Command_with_groups($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'With Groups',
		children: ($$anchor, $$slotProps) => {
			var div = root_9();
			var node = $.child(div);

			Button(node, {
				onclick: () => $.set(open, true),
				variant: 'outline',
				class: 'w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Menu');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Command.Dialog, ($$anchor, Command_Dialog) => {
				Command_Dialog($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_8();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
							Command_Input($$anchor, { placeholder: 'Type a command or search...' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
							Command_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_7();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
										Command_Empty($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('No results found.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
										Command_Group($$anchor, {
											heading: 'Suggestions',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root_3();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Command.Item, ($$anchor, Command_Item) => {
													Command_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root();
															var node_7 = $.first_child(fragment_4);

															IconPlaceholder(node_7, {
																lucide: 'CalendarIcon',
																tabler: 'IconCalendar',
																hugeicons: 'CalendarIcon',
																phosphor: 'CalendarBlankIcon',
																remixicon: 'RiCalendarLine'
															});

															$.next(2);
															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_6, 2);

												$.component(node_8, () => Command.Item, ($$anchor, Command_Item_1) => {
													Command_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_9 = $.first_child(fragment_5);

															IconPlaceholder(node_9, {
																lucide: 'SmileIcon',
																tabler: 'IconMoodSmile',
																hugeicons: 'SmileIcon',
																phosphor: 'SmileyIcon',
																remixicon: 'RiEmotionLine'
															});

															$.next(2);
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_8, 2);

												$.component(node_10, () => Command.Item, ($$anchor, Command_Item_2) => {
													Command_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_11 = $.first_child(fragment_6);

															IconPlaceholder(node_11, {
																lucide: 'CalculatorIcon',
																tabler: 'IconCalculator',
																hugeicons: 'CalculatorIcon',
																phosphor: 'CalculatorIcon',
																remixicon: 'RiCalculatorLine'
															});

															$.next(2);
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

									var node_12 = $.sibling(node_5, 2);

									$.component(node_12, () => Command.Separator, ($$anchor, Command_Separator) => {
										Command_Separator($$anchor, {});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Command.Group, ($$anchor, Command_Group_1) => {
										Command_Group_1($$anchor, {
											heading: 'Settings',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_3();
												var node_14 = $.first_child(fragment_7);

												$.component(node_14, () => Command.Item, ($$anchor, Command_Item_3) => {
													Command_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_4();
															var node_15 = $.first_child(fragment_8);

															IconPlaceholder(node_15, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															var node_16 = $.sibling(node_15, 4);

															$.component(node_16, () => Command.Shortcut, ($$anchor, Command_Shortcut) => {
																Command_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘P');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_14, 2);

												$.component(node_17, () => Command.Item, ($$anchor, Command_Item_4) => {
													Command_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_5();
															var node_18 = $.first_child(fragment_9);

															IconPlaceholder(node_18, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															var node_19 = $.sibling(node_18, 4);

															$.component(node_19, () => Command.Shortcut, ($$anchor, Command_Shortcut_1) => {
																Command_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘B');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_17, 2);

												$.component(node_20, () => Command.Item, ($$anchor, Command_Item_5) => {
													Command_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_6();
															var node_21 = $.first_child(fragment_10);

															IconPlaceholder(node_21, {
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
															});

															var node_22 = $.sibling(node_21, 4);

															$.component(node_22, () => Command.Shortcut, ($$anchor, Command_Shortcut_2) => {
																Command_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘S');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
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

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
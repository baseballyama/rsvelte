import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span>Profile</span> <!>`, 1);
var root_1 = $.from_html(`<!> <span>Billing</span> <!>`, 1);
var root_2 = $.from_html(`<!> <span>Settings</span> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Command_with_shortcuts($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'With Shortcuts',
		children: ($$anchor, $$slotProps) => {
			var div = root_5();
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
						var fragment_1 = root_4();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
							Command_Input($$anchor, { placeholder: 'Type a command or search...' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
							Command_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_4();
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
											heading: 'Settings',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root_3();
												var node_6 = $.first_child(fragment_3);

												$.component(node_6, () => Command.Item, ($$anchor, Command_Item) => {
													Command_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_4 = root();
															var node_7 = $.first_child(fragment_4);

															IconPlaceholder(node_7, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															var node_8 = $.sibling(node_7, 4);

															$.component(node_8, () => Command.Shortcut, ($$anchor, Command_Shortcut) => {
																Command_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⌘P');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_4);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_6, 2);

												$.component(node_9, () => Command.Item, ($$anchor, Command_Item_1) => {
													Command_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_10 = $.first_child(fragment_5);

															IconPlaceholder(node_10, {
																lucide: 'CreditCardIcon',
																tabler: 'IconCreditCard',
																hugeicons: 'CreditCardIcon',
																phosphor: 'CreditCardIcon',
																remixicon: 'RiBankCardLine'
															});

															var node_11 = $.sibling(node_10, 4);

															$.component(node_11, () => Command.Shortcut, ($$anchor, Command_Shortcut_1) => {
																Command_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘B');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_9, 2);

												$.component(node_12, () => Command.Item, ($$anchor, Command_Item_2) => {
													Command_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_13 = $.first_child(fragment_6);

															IconPlaceholder(node_13, {
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
															});

															var node_14 = $.sibling(node_13, 4);

															$.component(node_14, () => Command.Shortcut, ($$anchor, Command_Shortcut_2) => {
																Command_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘S');

																		$.append($$anchor, text_4);
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
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
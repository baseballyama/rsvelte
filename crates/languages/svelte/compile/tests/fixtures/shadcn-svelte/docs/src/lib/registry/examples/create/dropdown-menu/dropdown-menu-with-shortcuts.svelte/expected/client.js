import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Profile <!>`, 1);
var root_1 = $.from_html(`Billing <!>`, 1);
var root_2 = $.from_html(`Settings <!>`, 1);
var root_3 = $.from_html(`Keyboard shortcuts <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`Log out <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_with_shortcuts($$anchor) {
	Example($$anchor, {
		title: 'With Shortcuts',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_7();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_6();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_4();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('My Account');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_6 = root();
															var node_6 = $.sibling($.first_child(fragment_6));

															$.component(node_6, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																DropdownMenu_Shortcut($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('⇧⌘P');

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

												var node_7 = $.sibling(node_5, 2);

												$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_7 = root_1();
															var node_8 = $.sibling($.first_child(fragment_7));

															$.component(node_8, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
																DropdownMenu_Shortcut_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('⌘B');

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

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
													DropdownMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_8 = root_2();
															var node_10 = $.sibling($.first_child(fragment_8));

															$.component(node_10, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_2) => {
																DropdownMenu_Shortcut_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('⌘S');

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

												var node_11 = $.sibling(node_9, 2);

												$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
													DropdownMenu_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_9 = root_3();
															var node_12 = $.sibling($.first_child(fragment_9));

															$.component(node_12, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_3) => {
																DropdownMenu_Shortcut_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('⌘K');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_3, 2);

									$.component(node_13, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
										DropdownMenu_Item_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_10 = root_5();
												var node_15 = $.sibling($.first_child(fragment_10));

												$.component(node_15, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_4) => {
													DropdownMenu_Shortcut_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('⇧⌘Q');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`Profile <!>`, 1);
var root_1 = $.from_html(`Billing <!>`, 1);
var root_2 = $.from_html(`Settings <!>`, 1);
var root_3 = $.from_html(`Keyboard shortcuts <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`New Team <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`Log out <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_menu_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
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
						class: 'w-56',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_9();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
								DropdownMenu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('My Account');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_4();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root();
													var node_6 = $.sibling($.first_child(fragment_5));

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

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_5, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_6 = root_1();
													var node_8 = $.sibling($.first_child(fragment_6));

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

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_7 = root_2();
													var node_10 = $.sibling($.first_child(fragment_7));

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

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_9, 2);

										$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
											DropdownMenu_Item_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_3();
													var node_12 = $.sibling($.first_child(fragment_8));

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

							var node_13 = $.sibling(node_4, 2);

							$.component(node_13, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
								DropdownMenu_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root_7();
										var node_15 = $.first_child(fragment_9);

										$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
											DropdownMenu_Item_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Team');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
											DropdownMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_5();
													var node_17 = $.first_child(fragment_10);

													$.component(node_17, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
														DropdownMenu_SubTrigger($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Invite users');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
														DropdownMenu_SubContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_4();
																var node_19 = $.first_child(fragment_11);

																$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																	DropdownMenu_Item_5($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Email');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																	DropdownMenu_Item_6($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Message');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_21 = $.sibling(node_20, 2);

																$.component(node_21, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																	DropdownMenu_Separator_1($$anchor, {});
																});

																var node_22 = $.sibling(node_21, 2);

																$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																	DropdownMenu_Item_7($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('More...');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_16, 2);

										$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
											DropdownMenu_Item_8($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_12 = root_6();
													var node_24 = $.sibling($.first_child(fragment_12));

													$.component(node_24, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_4) => {
														DropdownMenu_Shortcut_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('⌘+T');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_14, 2);

							$.component(node_25, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
								DropdownMenu_Separator_2($$anchor, {});
							});

							var node_26 = $.sibling(node_25, 2);

							$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
								DropdownMenu_Item_9($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_12 = $.text('GitHub');

										$.append($$anchor, text_12);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_26, 2);

							$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
								DropdownMenu_Item_10($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text('Support');

										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});
							});

							var node_28 = $.sibling(node_27, 2);

							$.component(node_28, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
								DropdownMenu_Item_11($$anchor, {
									disabled: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text('API');

										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});
							});

							var node_29 = $.sibling(node_28, 2);

							$.component(node_29, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
								DropdownMenu_Separator_3($$anchor, {});
							});

							var node_30 = $.sibling(node_29, 2);

							$.component(node_30, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_12) => {
								DropdownMenu_Item_12($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_13 = root_8();
										var node_31 = $.sibling($.first_child(fragment_13));

										$.component(node_31, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_5) => {
											DropdownMenu_Shortcut_5($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('⇧⌘Q');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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
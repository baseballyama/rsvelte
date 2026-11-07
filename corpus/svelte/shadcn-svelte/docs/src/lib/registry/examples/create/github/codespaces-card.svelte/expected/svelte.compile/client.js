import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> New with options...`, 1);
var root_2 = $.from_html(`<!> Configure dev container`, 1);
var root_3 = $.from_html(`<!> Set up prebuilds`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> Manage codespaces`, 1);
var root_6 = $.from_html(`<!> Share deep link`, 1);
var root_7 = $.from_html(`<!> What are codespaces?`, 1);
var root_8 = $.from_html(`<!> Create Codespace`, 1);
var root_9 = $.from_html(`<!> <a href="#learn-more" class="text-xs text-muted-foreground underline underline-offset-4">Learn more about codespaces</a>`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!> <div class="p-1.5 text-xs text-muted-foreground">Codespace usage for this repository is paid for by <span class="font-medium">shadcn</span>.</div>`, 1);
var root_11 = $.from_html(`<!> Clone`, 1);
var root_12 = $.from_html(`Work fast with our official CLI. <a href="#learn-more">Learn more</a>`, 1);
var root_13 = $.from_html(`<!> <div class="rounded-md border bg-muted/30 p-2"><!> <!> <!></div>`, 1);
var root_14 = $.from_html(`<!> Open with GitHub Desktop`, 1);
var root_15 = $.from_html(`<!> Download ZIP`, 1);
var root_16 = $.from_html(`<!> <!> <!> <div class="flex flex-col"><!> <!></div>`, 1);

export default function Codespaces_card($$anchor) {
	let isCreatingCodespace = $.state(false);

	Example($$anchor, {
		title: 'Codespaces',
		class: 'min-h-[550px] lg:p-12',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-sm',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Tabs.Root, ($$anchor, Tabs_Root) => {
										Tabs_Root($$anchor, {
											value: 'codespaces',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_4();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Tabs.List, ($$anchor, Tabs_List) => {
													Tabs_List($$anchor, {
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_4 = $.first_child(fragment_5);

															$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
																Tabs_Trigger($$anchor, {
																	value: 'codespaces',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Codespaces');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_5 = $.sibling(node_4, 2);

															$.component(node_5, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
																Tabs_Trigger_1($$anchor, {
																	value: 'local',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('Local');

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

												var node_6 = $.sibling(node_3, 2);

												$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content) => {
													Tabs_Content($$anchor, {
														value: 'codespaces',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_10();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => Item.Root, ($$anchor, Item_Root) => {
																Item_Root($$anchor, {
																	size: 'sm',
																	class: 'px-1 pt-2',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
																			Item_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root();
																					var node_9 = $.first_child(fragment_8);

																					$.component(node_9, () => Item.Title, ($$anchor, Item_Title) => {
																						Item_Title($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('Codespaces');

																								$.append($$anchor, text_2);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_10 = $.sibling(node_9, 2);

																					$.component(node_10, () => Item.Description, ($$anchor, Item_Description) => {
																						Item_Description($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_3 = $.text('Your workspaces in the cloud');

																								$.append($$anchor, text_3);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_11 = $.sibling(node_8, 2);

																		$.component(node_11, () => Item.Actions, ($$anchor, Item_Actions) => {
																			Item_Actions($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_9 = root();
																					var node_12 = $.first_child(fragment_9);

																					$.component(node_12, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																						Tooltip_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = root();
																								var node_13 = $.first_child(fragment_10);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;

																										Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
																											children: ($$anchor, $$slotProps) => {
																												IconPlaceholder($$anchor, {
																													lucide: 'PlusIcon',
																													tabler: 'IconPlus',
																													hugeicons: 'PlusSignIcon',
																													phosphor: 'PlusIcon',
																													remixicon: 'RiAddLine'
																												});
																											},
																											$$slots: { default: true }
																										}));
																									};

																									$.component(node_13, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																										Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_14 = $.sibling(node_13, 2);

																								$.component(node_14, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																									Tooltip_Content($$anchor, {
																										side: 'bottom',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('Create a codespace on main');

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

																					var node_15 = $.sibling(node_12, 2);

																					$.component(node_15, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																						DropdownMenu_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_13 = root();
																								var node_16 = $.first_child(fragment_13);

																								$.component(node_16, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																									Tooltip_Root_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = root();
																											var node_17 = $.first_child(fragment_14);

																											{
																												const child = ($$anchor, $$arg0) => {
																													let props = () => ($$arg0?.()).props;
																													var fragment_15 = $.comment();
																													var node_18 = $.first_child(fragment_15);

																													{
																														const child = ($$anchor, $$arg0) => {
																															let triggerProps = () => ($$arg0?.()).props;

																															Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, triggerProps, {
																																children: ($$anchor, $$slotProps) => {
																																	IconPlaceholder($$anchor, {
																																		lucide: 'MoreHorizontalIcon',
																																		tabler: 'IconDots',
																																		hugeicons: 'MoreHorizontalCircle01Icon',
																																		phosphor: 'DotsThreeOutlineIcon',
																																		remixicon: 'RiMoreLine'
																																	});
																																},
																																$$slots: { default: true }
																															}));
																														};

																														$.component(node_18, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																															DropdownMenu_Trigger($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
																														});
																													}

																													$.append($$anchor, fragment_15);
																												};

																												$.component(node_17, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																													Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
																												});
																											}

																											var node_19 = $.sibling(node_17, 2);

																											$.component(node_19, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																												Tooltip_Content_1($$anchor, {
																													side: 'bottom',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_5 = $.text('Codespace repository configuration');

																														$.append($$anchor, text_5);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_14);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_20 = $.sibling(node_16, 2);

																								$.component(node_20, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																									DropdownMenu_Content($$anchor, {
																										align: 'end',
																										class: 'w-56',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_18 = root_4();
																											var node_21 = $.first_child(fragment_18);

																											$.component(node_21, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																												DropdownMenu_Group($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_19 = root_4();
																														var node_22 = $.first_child(fragment_19);

																														$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																															DropdownMenu_Item($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_20 = root_1();
																																	var node_23 = $.first_child(fragment_20);

																																	IconPlaceholder(node_23, {
																																		lucide: 'PlusIcon',
																																		tabler: 'IconPlus',
																																		hugeicons: 'PlusSignIcon',
																																		phosphor: 'PlusIcon',
																																		remixicon: 'RiAddLine'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_20);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_24 = $.sibling(node_22, 2);

																														$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																															DropdownMenu_Item_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_21 = root_2();
																																	var node_25 = $.first_child(fragment_21);

																																	IconPlaceholder(node_25, {
																																		lucide: 'ContainerIcon',
																																		tabler: 'IconBox',
																																		hugeicons: 'CubeIcon',
																																		phosphor: 'CubeIcon',
																																		remixicon: 'RiBox1Line'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_21);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_26 = $.sibling(node_24, 2);

																														$.component(node_26, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																															DropdownMenu_Item_2($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_22 = root_3();
																																	var node_27 = $.first_child(fragment_22);

																																	IconPlaceholder(node_27, {
																																		lucide: 'ZapIcon',
																																		tabler: 'IconBolt',
																																		hugeicons: 'ZapIcon',
																																		phosphor: 'LightningIcon',
																																		remixicon: 'RiFlashlightLine'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_22);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_19);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_28 = $.sibling(node_21, 2);

																											$.component(node_28, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																												DropdownMenu_Separator($$anchor, {});
																											});

																											var node_29 = $.sibling(node_28, 2);

																											$.component(node_29, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																												DropdownMenu_Group_1($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_23 = root_4();
																														var node_30 = $.first_child(fragment_23);

																														$.component(node_30, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																															DropdownMenu_Item_3($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_24 = root_5();
																																	var node_31 = $.first_child(fragment_24);

																																	IconPlaceholder(node_31, {
																																		lucide: 'ServerIcon',
																																		tabler: 'IconServer',
																																		hugeicons: 'ServerStackIcon',
																																		phosphor: 'HardDrivesIcon',
																																		remixicon: 'RiServerLine'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_24);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_32 = $.sibling(node_30, 2);

																														$.component(node_32, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																															DropdownMenu_Item_4($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_25 = root_6();
																																	var node_33 = $.first_child(fragment_25);

																																	IconPlaceholder(node_33, {
																																		lucide: 'ShareIcon',
																																		tabler: 'IconShare2',
																																		hugeicons: 'Share03Icon',
																																		phosphor: 'ShareIcon',
																																		remixicon: 'RiShareLine'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_25);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_34 = $.sibling(node_32, 2);

																														$.component(node_34, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																															DropdownMenu_Item_5($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_26 = root_7();
																																	var node_35 = $.first_child(fragment_26);

																																	IconPlaceholder(node_35, {
																																		lucide: 'InfoIcon',
																																		tabler: 'IconInfoCircle',
																																		hugeicons: 'AlertCircleIcon',
																																		phosphor: 'InfoIcon',
																																		remixicon: 'RiInformationLine'
																																	});

																																	$.next();
																																	$.append($$anchor, fragment_26);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_23);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_18);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_13);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_9);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_36 = $.sibling(node_7, 2);

															Separator(node_36, { class: '-mx-2 my-2 w-auto!' });

															var node_37 = $.sibling(node_36, 2);

															$.component(node_37, () => Empty.Root, ($$anchor, Empty_Root) => {
																Empty_Root($$anchor, {
																	class: 'p-4',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_27 = root();
																		var node_38 = $.first_child(fragment_27);

																		$.component(node_38, () => Empty.Header, ($$anchor, Empty_Header) => {
																			Empty_Header($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_28 = root_4();
																					var node_39 = $.first_child(fragment_28);

																					$.component(node_39, () => Empty.Media, ($$anchor, Empty_Media) => {
																						Empty_Media($$anchor, {
																							variant: 'icon',
																							children: ($$anchor, $$slotProps) => {
																								IconPlaceholder($$anchor, {
																									lucide: 'ServerIcon',
																									tabler: 'IconServer',
																									hugeicons: 'ServerStackIcon',
																									phosphor: 'HardDrivesIcon',
																									remixicon: 'RiServerLine'
																								});
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_40 = $.sibling(node_39, 2);

																					$.component(node_40, () => Empty.Title, ($$anchor, Empty_Title) => {
																						Empty_Title($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('No codespaces');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_41 = $.sibling(node_40, 2);

																					$.component(node_41, () => Empty.Description, ($$anchor, Empty_Description) => {
																						Empty_Description($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text('You don\'t have any codespaces with this repository checked out');

																								$.append($$anchor, text_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_28);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_42 = $.sibling(node_38, 2);

																		$.component(node_42, () => Empty.Content, ($$anchor, Empty_Content) => {
																			Empty_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_30 = root_9();
																					var node_43 = $.first_child(fragment_30);

																					Button(node_43, {
																						size: 'sm',
																						onclick: () => {
																							$.set(isCreatingCodespace, true);

																							setTimeout(
																								() => {
																									$.set(isCreatingCodespace, false);
																								},
																								2000
																							);
																						},

																						get disabled() {
																							return $.get(isCreatingCodespace);
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_31 = root_8();
																							var node_44 = $.first_child(fragment_31);

																							{
																								var consequent = ($$anchor) => {
																									Spinner($$anchor, { 'data-icon': 'inline-start' });
																								};

																								$.if(node_44, ($$render) => {
																									if ($.get(isCreatingCodespace)) $$render(consequent);
																								});
																							}

																							$.next();
																							$.append($$anchor, fragment_31);
																						},
																						$$slots: { default: true }
																					});

																					$.next(2);
																					$.append($$anchor, fragment_30);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_27);
																	},
																	$$slots: { default: true }
																});
															});

															var node_45 = $.sibling(node_37, 2);

															Separator(node_45, { class: '-mx-2 my-2 w-auto!' });
															$.next(2);
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_46 = $.sibling(node_6, 2);

												$.component(node_46, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
													Tabs_Content_1($$anchor, {
														value: 'local',
														children: ($$anchor, $$slotProps) => {
															var fragment_33 = root_16();
															var node_47 = $.first_child(fragment_33);

															$.component(node_47, () => Item.Root, ($$anchor, Item_Root_1) => {
																Item_Root_1($$anchor, {
																	size: 'sm',
																	class: 'hidden p-0',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_34 = root();
																		var node_48 = $.first_child(fragment_34);

																		$.component(node_48, () => Item.Content, ($$anchor, Item_Content_1) => {
																			Item_Content_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_35 = $.comment();
																					var node_49 = $.first_child(fragment_35);

																					$.component(node_49, () => Item.Title, ($$anchor, Item_Title_1) => {
																						Item_Title_1($$anchor, {
																							class: 'gap-2',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_36 = root_11();
																								var node_50 = $.first_child(fragment_36);

																								IconPlaceholder(node_50, {
																									lucide: 'TerminalIcon',
																									tabler: 'IconTerminal',
																									hugeicons: 'ComputerTerminal01Icon',
																									phosphor: 'TerminalIcon',
																									remixicon: 'RiTerminalBoxLine',
																									class: 'size-4'
																								});

																								$.next();
																								$.append($$anchor, fragment_36);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_35);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_51 = $.sibling(node_48, 2);

																		$.component(node_51, () => Item.Actions, ($$anchor, Item_Actions_1) => {
																			Item_Actions_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_37 = $.comment();
																					var node_52 = $.first_child(fragment_37);

																					$.component(node_52, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
																						Tooltip_Root_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_38 = root();
																								var node_53 = $.first_child(fragment_38);

																								{
																									const child = ($$anchor, $$arg0) => {
																										let props = () => ($$arg0?.()).props;

																										Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
																											children: ($$anchor, $$slotProps) => {
																												IconPlaceholder($$anchor, {
																													lucide: 'InfoIcon',
																													tabler: 'IconInfoCircle',
																													hugeicons: 'AlertCircleIcon',
																													phosphor: 'InfoIcon',
																													remixicon: 'RiInformationLine'
																												});
																											},
																											$$slots: { default: true }
																										}));
																									};

																									$.component(node_53, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																										Tooltip_Trigger_2($$anchor, { child, $$slots: { child: true } });
																									});
																								}

																								var node_54 = $.sibling(node_53, 2);

																								$.component(node_54, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																									Tooltip_Content_2($$anchor, {
																										side: 'left',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text('Which remote URL should I use?');

																											$.append($$anchor, text_8);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_38);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_37);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_34);
																	},
																	$$slots: { default: true }
																});
															});

															var node_55 = $.sibling(node_47, 2);

															$.component(node_55, () => Tabs.Root, ($$anchor, Tabs_Root_1) => {
																Tabs_Root_1($$anchor, {
																	value: 'https',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_41 = root_13();
																		var node_56 = $.first_child(fragment_41);

																		$.component(node_56, () => Tabs.List, ($$anchor, Tabs_List_1) => {
																			Tabs_List_1($$anchor, {
																				variant: 'line',
																				class: 'w-full justify-start border-b *:[button]:flex-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_42 = root_4();
																					var node_57 = $.first_child(fragment_42);

																					$.component(node_57, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
																						Tabs_Trigger_2($$anchor, {
																							value: 'https',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_9 = $.text('HTTPS');

																								$.append($$anchor, text_9);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_58 = $.sibling(node_57, 2);

																					$.component(node_58, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
																						Tabs_Trigger_3($$anchor, {
																							value: 'ssh',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_10 = $.text('SSH');

																								$.append($$anchor, text_10);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_59 = $.sibling(node_58, 2);

																					$.component(node_59, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_4) => {
																						Tabs_Trigger_4($$anchor, {
																							value: 'cli',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_11 = $.text('GitHub CLI');

																								$.append($$anchor, text_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_42);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var div = $.sibling(node_56, 2);
																		var node_60 = $.child(div);

																		$.component(node_60, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
																			Tabs_Content_2($$anchor, {
																				value: 'https',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_43 = $.comment();
																					var node_61 = $.first_child(fragment_43);

																					$.component(node_61, () => Field.Field, ($$anchor, Field_Field) => {
																						Field_Field($$anchor, {
																							class: 'gap-2',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_44 = root_4();
																								var node_62 = $.first_child(fragment_44);

																								$.component(node_62, () => Field.Label, ($$anchor, Field_Label) => {
																									Field_Label($$anchor, {
																										for: 'https-url',
																										class: 'sr-only',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_12 = $.text('HTTPS URL');

																											$.append($$anchor, text_12);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_63 = $.sibling(node_62, 2);

																								$.component(node_63, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																									InputGroup_Root($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_45 = root();
																											var node_64 = $.first_child(fragment_45);

																											$.component(node_64, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																												InputGroup_Addon($$anchor, {
																													align: 'inline-end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_46 = $.comment();
																														var node_65 = $.first_child(fragment_46);

																														$.component(node_65, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																															InputGroup_Button($$anchor, {
																																variant: 'ghost',
																																size: 'icon-xs',
																																children: ($$anchor, $$slotProps) => {
																																	IconPlaceholder($$anchor, {
																																		lucide: 'CopyIcon',
																																		tabler: 'IconCopy',
																																		hugeicons: 'Copy01Icon',
																																		phosphor: 'CopyIcon',
																																		remixicon: 'RiFileCopyLine'
																																	});
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_46);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_66 = $.sibling(node_64, 2);

																											$.component(node_66, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																												InputGroup_Input($$anchor, {
																													id: 'https-url',
																													value: 'https://github.com/shadcn-ui/ui.git',
																													readonly: true
																												});
																											});

																											$.append($$anchor, fragment_45);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_67 = $.sibling(node_63, 2);

																								$.component(node_67, () => Field.Description, ($$anchor, Field_Description) => {
																									Field_Description($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_13 = $.text('Clone using the web URL.');

																											$.append($$anchor, text_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_44);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_43);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_68 = $.sibling(node_60, 2);

																		$.component(node_68, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
																			Tabs_Content_3($$anchor, {
																				value: 'ssh',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_48 = $.comment();
																					var node_69 = $.first_child(fragment_48);

																					$.component(node_69, () => Field.Field, ($$anchor, Field_Field_1) => {
																						Field_Field_1($$anchor, {
																							class: 'gap-2',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_49 = root_4();
																								var node_70 = $.first_child(fragment_49);

																								$.component(node_70, () => Field.Label, ($$anchor, Field_Label_1) => {
																									Field_Label_1($$anchor, {
																										for: 'ssh-url',
																										class: 'sr-only',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_14 = $.text('SSH URL');

																											$.append($$anchor, text_14);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_71 = $.sibling(node_70, 2);

																								$.component(node_71, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																									InputGroup_Root_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_50 = root();
																											var node_72 = $.first_child(fragment_50);

																											$.component(node_72, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																												InputGroup_Addon_1($$anchor, {
																													align: 'inline-end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_51 = $.comment();
																														var node_73 = $.first_child(fragment_51);

																														$.component(node_73, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																															InputGroup_Button_1($$anchor, {
																																variant: 'ghost',
																																size: 'icon-xs',
																																children: ($$anchor, $$slotProps) => {
																																	IconPlaceholder($$anchor, {
																																		lucide: 'CopyIcon',
																																		tabler: 'IconCopy',
																																		hugeicons: 'Copy01Icon',
																																		phosphor: 'CopyIcon',
																																		remixicon: 'RiFileCopyLine'
																																	});
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_51);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_74 = $.sibling(node_72, 2);

																											$.component(node_74, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																												InputGroup_Input_1($$anchor, {
																													id: 'ssh-url',
																													value: 'git@github.com:shadcn-ui/ui.git',
																													readonly: true
																												});
																											});

																											$.append($$anchor, fragment_50);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_75 = $.sibling(node_71, 2);

																								$.component(node_75, () => Field.Description, ($$anchor, Field_Description_1) => {
																									Field_Description_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_15 = $.text('Use a password-protected SSH key.');

																											$.append($$anchor, text_15);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_49);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_48);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_76 = $.sibling(node_68, 2);

																		$.component(node_76, () => Tabs.Content, ($$anchor, Tabs_Content_4) => {
																			Tabs_Content_4($$anchor, {
																				value: 'cli',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_53 = $.comment();
																					var node_77 = $.first_child(fragment_53);

																					$.component(node_77, () => Field.Field, ($$anchor, Field_Field_2) => {
																						Field_Field_2($$anchor, {
																							class: 'gap-2',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_54 = root_4();
																								var node_78 = $.first_child(fragment_54);

																								$.component(node_78, () => Field.Label, ($$anchor, Field_Label_2) => {
																									Field_Label_2($$anchor, {
																										for: 'cli-command',
																										class: 'sr-only',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_16 = $.text('CLI Command');

																											$.append($$anchor, text_16);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_79 = $.sibling(node_78, 2);

																								$.component(node_79, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
																									InputGroup_Root_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_55 = root();
																											var node_80 = $.first_child(fragment_55);

																											$.component(node_80, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																												InputGroup_Addon_2($$anchor, {
																													align: 'inline-end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_56 = $.comment();
																														var node_81 = $.first_child(fragment_56);

																														$.component(node_81, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																															InputGroup_Button_2($$anchor, {
																																variant: 'ghost',
																																size: 'icon-xs',
																																children: ($$anchor, $$slotProps) => {
																																	IconPlaceholder($$anchor, {
																																		lucide: 'CopyIcon',
																																		tabler: 'IconCopy',
																																		hugeicons: 'Copy01Icon',
																																		phosphor: 'CopyIcon',
																																		remixicon: 'RiFileCopyLine'
																																	});
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_56);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_82 = $.sibling(node_80, 2);

																											$.component(node_82, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
																												InputGroup_Input_2($$anchor, {
																													id: 'cli-command',
																													value: 'gh repo clone shadcn-ui/ui',
																													readonly: true
																												});
																											});

																											$.append($$anchor, fragment_55);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_83 = $.sibling(node_79, 2);

																								$.component(node_83, () => Field.Description, ($$anchor, Field_Description_2) => {
																									Field_Description_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var fragment_58 = root_12();

																											$.next();
																											$.append($$anchor, fragment_58);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_54);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_53);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.reset(div);
																		$.append($$anchor, fragment_41);
																	},
																	$$slots: { default: true }
																});
															});

															var node_84 = $.sibling(node_55, 2);

															Separator(node_84, { class: '-mx-2 my-2 w-auto!' });

															var div_1 = $.sibling(node_84, 2);
															var node_85 = $.child(div_1);

															Button(node_85, {
																variant: 'ghost',
																size: 'sm',
																class: 'justify-start gap-1.5',
																children: ($$anchor, $$slotProps) => {
																	var fragment_59 = root_14();
																	var node_86 = $.first_child(fragment_59);

																	IconPlaceholder(node_86, {
																		lucide: 'MonitorIcon',
																		tabler: 'IconDeviceDesktop',
																		hugeicons: 'ComputerIcon',
																		phosphor: 'MonitorIcon',
																		remixicon: 'RiComputerLine',
																		'data-icon': 'inline-start'
																	});

																	$.next();
																	$.append($$anchor, fragment_59);
																},
																$$slots: { default: true }
															});

															var node_87 = $.sibling(node_85, 2);

															Button(node_87, {
																variant: 'ghost',
																size: 'sm',
																class: 'justify-start gap-1.5',
																children: ($$anchor, $$slotProps) => {
																	var fragment_60 = root_15();
																	var node_88 = $.first_child(fragment_60);

																	IconPlaceholder(node_88, {
																		lucide: 'DownloadIcon',
																		tabler: 'IconDownload',
																		hugeicons: 'DownloadIcon',
																		phosphor: 'DownloadIcon',
																		remixicon: 'RiDownloadLine',
																		'data-icon': 'inline-start'
																	});

																	$.next();
																	$.append($$anchor, fragment_60);
																},
																$$slots: { default: true }
															});

															$.reset(div_1);
															$.append($$anchor, fragment_33);
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
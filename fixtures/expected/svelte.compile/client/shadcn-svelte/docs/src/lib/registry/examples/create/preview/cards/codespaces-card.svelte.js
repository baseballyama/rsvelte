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
var root_12 = $.from_html(`Work fast with our official CLI. <a href="https://cli.github.com">Learn more</a>`, 1);
var root_13 = $.from_html(`<!> <div class="rounded-md border bg-muted/30 p-2"><!> <!> <!></div>`, 1);
var root_14 = $.from_html(`<!> Open with GitHub Desktop`, 1);
var root_15 = $.from_html(`<!> Download ZIP`, 1);
var root_16 = $.from_html(`<!> <!> <!> <div class="flex flex-col"><!> <!></div>`, 1);

export default function Codespaces_card($$anchor) {
	let isCreatingCodespace = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									value: 'codespaces',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Tabs.List, ($$anchor, Tabs_List) => {
											Tabs_List($$anchor, {
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

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

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_3, 2);

										$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content) => {
											Tabs_Content($$anchor, {
												value: 'codespaces',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_10();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Item.Root, ($$anchor, Item_Root) => {
														Item_Root($$anchor, {
															size: 'sm',
															class: 'px-1 pt-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
																	Item_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_9 = $.first_child(fragment_7);

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

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_8, 2);

																$.component(node_11, () => Item.Actions, ($$anchor, Item_Actions) => {
																	Item_Actions($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root();
																			var node_12 = $.first_child(fragment_8);

																			$.component(node_12, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																				Tooltip_Root($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root();
																						var node_13 = $.first_child(fragment_9);

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

																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_15 = $.sibling(node_12, 2);

																			$.component(node_15, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																				DropdownMenu_Root($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root();
																						var node_16 = $.first_child(fragment_12);

																						{
																							const child = ($$anchor, $$arg0) => {
																								let props = () => ($$arg0?.()).props;

																								Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
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

																							$.component(node_16, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_17 = $.sibling(node_16, 2);

																						$.component(node_17, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																							DropdownMenu_Content($$anchor, {
																								align: 'end',
																								class: 'w-56',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_15 = root_4();
																									var node_18 = $.first_child(fragment_15);

																									$.component(node_18, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																										DropdownMenu_Group($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_16 = root_4();
																												var node_19 = $.first_child(fragment_16);

																												$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																													DropdownMenu_Item($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_17 = root_1();
																															var node_20 = $.first_child(fragment_17);

																															IconPlaceholder(node_20, {
																																lucide: 'PlusIcon',
																																tabler: 'IconPlus',
																																hugeicons: 'PlusSignIcon',
																																phosphor: 'PlusIcon',
																																remixicon: 'RiAddLine'
																															});

																															$.next();
																															$.append($$anchor, fragment_17);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_21 = $.sibling(node_19, 2);

																												$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																													DropdownMenu_Item_1($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_18 = root_2();
																															var node_22 = $.first_child(fragment_18);

																															IconPlaceholder(node_22, {
																																lucide: 'ContainerIcon',
																																tabler: 'IconBox',
																																hugeicons: 'CubeIcon',
																																phosphor: 'CubeIcon',
																																remixicon: 'RiBox1Line'
																															});

																															$.next();
																															$.append($$anchor, fragment_18);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_23 = $.sibling(node_21, 2);

																												$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																													DropdownMenu_Item_2($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_19 = root_3();
																															var node_24 = $.first_child(fragment_19);

																															IconPlaceholder(node_24, {
																																lucide: 'ZapIcon',
																																tabler: 'IconBolt',
																																hugeicons: 'ZapIcon',
																																phosphor: 'LightningIcon',
																																remixicon: 'RiFlashlightLine'
																															});

																															$.next();
																															$.append($$anchor, fragment_19);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_16);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_25 = $.sibling(node_18, 2);

																									$.component(node_25, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																										DropdownMenu_Separator($$anchor, {});
																									});

																									var node_26 = $.sibling(node_25, 2);

																									$.component(node_26, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																										DropdownMenu_Group_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_20 = root_4();
																												var node_27 = $.first_child(fragment_20);

																												$.component(node_27, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																													DropdownMenu_Item_3($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_21 = root_5();
																															var node_28 = $.first_child(fragment_21);

																															IconPlaceholder(node_28, {
																																lucide: 'ServerIcon',
																																tabler: 'IconServer',
																																hugeicons: 'ServerStackIcon',
																																phosphor: 'HardDrivesIcon',
																																remixicon: 'RiHardDriveLine'
																															});

																															$.next();
																															$.append($$anchor, fragment_21);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_29 = $.sibling(node_27, 2);

																												$.component(node_29, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																													DropdownMenu_Item_4($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_22 = root_6();
																															var node_30 = $.first_child(fragment_22);

																															IconPlaceholder(node_30, {
																																lucide: 'ShareIcon',
																																tabler: 'IconShare2',
																																hugeicons: 'Share03Icon',
																																phosphor: 'ShareIcon',
																																remixicon: 'RiShareLine'
																															});

																															$.next();
																															$.append($$anchor, fragment_22);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_31 = $.sibling(node_29, 2);

																												$.component(node_31, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																													DropdownMenu_Item_5($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_23 = root_7();
																															var node_32 = $.first_child(fragment_23);

																															IconPlaceholder(node_32, {
																																lucide: 'InfoIcon',
																																tabler: 'IconInfoCircle',
																																hugeicons: 'AlertCircleIcon',
																																phosphor: 'InfoIcon',
																																remixicon: 'RiInformationLine'
																															});

																															$.next();
																															$.append($$anchor, fragment_23);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_20);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_15);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_8);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_33 = $.sibling(node_7, 2);

													Separator(node_33, { class: '-mx-2 my-2 w-auto!' });

													var node_34 = $.sibling(node_33, 2);

													$.component(node_34, () => Empty.Root, ($$anchor, Empty_Root) => {
														Empty_Root($$anchor, {
															class: 'p-4',
															children: ($$anchor, $$slotProps) => {
																var fragment_24 = root();
																var node_35 = $.first_child(fragment_24);

																$.component(node_35, () => Empty.Header, ($$anchor, Empty_Header) => {
																	Empty_Header($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = root_4();
																			var node_36 = $.first_child(fragment_25);

																			$.component(node_36, () => Empty.Media, ($$anchor, Empty_Media) => {
																				Empty_Media($$anchor, {
																					variant: 'icon',
																					children: ($$anchor, $$slotProps) => {
																						IconPlaceholder($$anchor, {
																							lucide: 'ServerIcon',
																							tabler: 'IconServer',
																							hugeicons: 'ServerStackIcon',
																							phosphor: 'HardDrivesIcon',
																							remixicon: 'RiHardDriveLine'
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_37 = $.sibling(node_36, 2);

																			$.component(node_37, () => Empty.Title, ($$anchor, Empty_Title) => {
																				Empty_Title($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('No codespaces');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_38 = $.sibling(node_37, 2);

																			$.component(node_38, () => Empty.Description, ($$anchor, Empty_Description) => {
																				Empty_Description($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('You don\'t have any codespaces with this repository checked out');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_39 = $.sibling(node_35, 2);

																$.component(node_39, () => Empty.Content, ($$anchor, Empty_Content) => {
																	Empty_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_27 = root_9();
																			var node_40 = $.first_child(fragment_27);

																			Button(node_40, {
																				size: 'sm',
																				get disabled() {
																					return $.get(isCreatingCodespace);
																				},

																				onclick: () => {
																					$.set(isCreatingCodespace, true);
																					setTimeout(() => $.set(isCreatingCodespace, false), 2000);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_28 = root_8();
																					var node_41 = $.first_child(fragment_28);

																					{
																						var consequent = ($$anchor) => {
																							Spinner($$anchor, { 'data-icon': 'inline-start' });
																						};

																						$.if(node_41, ($$render) => {
																							if ($.get(isCreatingCodespace)) $$render(consequent);
																						});
																					}

																					$.next();
																					$.append($$anchor, fragment_28);
																				},
																				$$slots: { default: true }
																			});

																			$.next(2);
																			$.append($$anchor, fragment_27);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_24);
															},
															$$slots: { default: true }
														});
													});

													var node_42 = $.sibling(node_34, 2);

													Separator(node_42, { class: '-mx-2 my-2 w-auto!' });
													$.next(2);
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_43 = $.sibling(node_6, 2);

										$.component(node_43, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
											Tabs_Content_1($$anchor, {
												value: 'local',
												children: ($$anchor, $$slotProps) => {
													var fragment_30 = root_16();
													var node_44 = $.first_child(fragment_30);

													$.component(node_44, () => Item.Root, ($$anchor, Item_Root_1) => {
														Item_Root_1($$anchor, {
															size: 'sm',
															class: 'hidden p-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_31 = root();
																var node_45 = $.first_child(fragment_31);

																$.component(node_45, () => Item.Content, ($$anchor, Item_Content_1) => {
																	Item_Content_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_32 = $.comment();
																			var node_46 = $.first_child(fragment_32);

																			$.component(node_46, () => Item.Title, ($$anchor, Item_Title_1) => {
																				Item_Title_1($$anchor, {
																					class: 'gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_33 = root_11();
																						var node_47 = $.first_child(fragment_33);

																						IconPlaceholder(node_47, {
																							lucide: 'TerminalIcon',
																							tabler: 'IconTerminal',
																							hugeicons: 'ComputerTerminal01Icon',
																							phosphor: 'TerminalIcon',
																							remixicon: 'RiTerminalBoxLine',
																							class: 'size-4'
																						});

																						$.next();
																						$.append($$anchor, fragment_33);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_32);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_48 = $.sibling(node_45, 2);

																$.component(node_48, () => Item.Actions, ($$anchor, Item_Actions_1) => {
																	Item_Actions_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_34 = $.comment();
																			var node_49 = $.first_child(fragment_34);

																			$.component(node_49, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																				Tooltip_Root_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_35 = root();
																						var node_50 = $.first_child(fragment_35);

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

																							$.component(node_50, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																								Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
																							});
																						}

																						var node_51 = $.sibling(node_50, 2);

																						$.component(node_51, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																							Tooltip_Content_1($$anchor, {
																								side: 'left',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_7 = $.text('Which remote URL should I use?');

																									$.append($$anchor, text_7);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_35);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_34);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_31);
															},
															$$slots: { default: true }
														});
													});

													var node_52 = $.sibling(node_44, 2);

													$.component(node_52, () => Tabs.Root, ($$anchor, Tabs_Root_1) => {
														Tabs_Root_1($$anchor, {
															value: 'https',
															children: ($$anchor, $$slotProps) => {
																var fragment_38 = root_13();
																var node_53 = $.first_child(fragment_38);

																$.component(node_53, () => Tabs.List, ($$anchor, Tabs_List_1) => {
																	Tabs_List_1($$anchor, {
																		variant: 'line',
																		class: 'w-full justify-start border-b *:[button]:flex-0',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_39 = root_4();
																			var node_54 = $.first_child(fragment_39);

																			$.component(node_54, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
																				Tabs_Trigger_2($$anchor, {
																					value: 'https',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('HTTPS');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_55 = $.sibling(node_54, 2);

																			$.component(node_55, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
																				Tabs_Trigger_3($$anchor, {
																					value: 'ssh',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('SSH');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_56 = $.sibling(node_55, 2);

																			$.component(node_56, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_4) => {
																				Tabs_Trigger_4($$anchor, {
																					value: 'cli',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_10 = $.text('GitHub CLI');

																						$.append($$anchor, text_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_39);
																		},
																		$$slots: { default: true }
																	});
																});

																var div = $.sibling(node_53, 2);
																var node_57 = $.child(div);

																$.component(node_57, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
																	Tabs_Content_2($$anchor, {
																		value: 'https',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_40 = $.comment();
																			var node_58 = $.first_child(fragment_40);

																			$.component(node_58, () => Field.Field, ($$anchor, Field_Field) => {
																				Field_Field($$anchor, {
																					class: 'gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_41 = root_4();
																						var node_59 = $.first_child(fragment_41);

																						$.component(node_59, () => Field.Label, ($$anchor, Field_Label) => {
																							Field_Label($$anchor, {
																								for: 'https-url',
																								class: 'sr-only',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_11 = $.text('HTTPS URL');

																									$.append($$anchor, text_11);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_60 = $.sibling(node_59, 2);

																						$.component(node_60, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																							InputGroup_Root($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_42 = root();
																									var node_61 = $.first_child(fragment_42);

																									$.component(node_61, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																										InputGroup_Addon($$anchor, {
																											align: 'inline-end',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_43 = $.comment();
																												var node_62 = $.first_child(fragment_43);

																												$.component(node_62, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
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

																												$.append($$anchor, fragment_43);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_63 = $.sibling(node_61, 2);

																									$.component(node_63, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																										InputGroup_Input($$anchor, {
																											id: 'https-url',
																											value: 'https://github.com/shadcn-ui/ui.git',
																											readonly: true
																										});
																									});

																									$.append($$anchor, fragment_42);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_64 = $.sibling(node_60, 2);

																						$.component(node_64, () => Field.Description, ($$anchor, Field_Description) => {
																							Field_Description($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_12 = $.text('Clone using the web URL.');

																									$.append($$anchor, text_12);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_41);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_40);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_65 = $.sibling(node_57, 2);

																$.component(node_65, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
																	Tabs_Content_3($$anchor, {
																		value: 'ssh',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_45 = $.comment();
																			var node_66 = $.first_child(fragment_45);

																			$.component(node_66, () => Field.Field, ($$anchor, Field_Field_1) => {
																				Field_Field_1($$anchor, {
																					class: 'gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_46 = root_4();
																						var node_67 = $.first_child(fragment_46);

																						$.component(node_67, () => Field.Label, ($$anchor, Field_Label_1) => {
																							Field_Label_1($$anchor, {
																								for: 'ssh-url',
																								class: 'sr-only',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_13 = $.text('SSH URL');

																									$.append($$anchor, text_13);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_68 = $.sibling(node_67, 2);

																						$.component(node_68, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																							InputGroup_Root_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_47 = root();
																									var node_69 = $.first_child(fragment_47);

																									$.component(node_69, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																										InputGroup_Addon_1($$anchor, {
																											align: 'inline-end',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_48 = $.comment();
																												var node_70 = $.first_child(fragment_48);

																												$.component(node_70, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
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

																												$.append($$anchor, fragment_48);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_71 = $.sibling(node_69, 2);

																									$.component(node_71, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																										InputGroup_Input_1($$anchor, {
																											id: 'ssh-url',
																											value: 'git@github.com:shadcn-ui/ui.git',
																											readonly: true
																										});
																									});

																									$.append($$anchor, fragment_47);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_72 = $.sibling(node_68, 2);

																						$.component(node_72, () => Field.Description, ($$anchor, Field_Description_1) => {
																							Field_Description_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_14 = $.text('Use a password-protected SSH key.');

																									$.append($$anchor, text_14);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_46);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_45);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_73 = $.sibling(node_65, 2);

																$.component(node_73, () => Tabs.Content, ($$anchor, Tabs_Content_4) => {
																	Tabs_Content_4($$anchor, {
																		value: 'cli',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_50 = $.comment();
																			var node_74 = $.first_child(fragment_50);

																			$.component(node_74, () => Field.Field, ($$anchor, Field_Field_2) => {
																				Field_Field_2($$anchor, {
																					class: 'gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_51 = root_4();
																						var node_75 = $.first_child(fragment_51);

																						$.component(node_75, () => Field.Label, ($$anchor, Field_Label_2) => {
																							Field_Label_2($$anchor, {
																								for: 'cli-command',
																								class: 'sr-only',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_15 = $.text('CLI Command');

																									$.append($$anchor, text_15);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_76 = $.sibling(node_75, 2);

																						$.component(node_76, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
																							InputGroup_Root_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_52 = root();
																									var node_77 = $.first_child(fragment_52);

																									$.component(node_77, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																										InputGroup_Addon_2($$anchor, {
																											align: 'inline-end',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_53 = $.comment();
																												var node_78 = $.first_child(fragment_53);

																												$.component(node_78, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
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

																												$.append($$anchor, fragment_53);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_79 = $.sibling(node_77, 2);

																									$.component(node_79, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
																										InputGroup_Input_2($$anchor, {
																											id: 'cli-command',
																											value: 'gh repo clone shadcn-ui/ui',
																											readonly: true
																										});
																									});

																									$.append($$anchor, fragment_52);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_80 = $.sibling(node_76, 2);

																						$.component(node_80, () => Field.Description, ($$anchor, Field_Description_2) => {
																							Field_Description_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_55 = root_12();

																									$.next();
																									$.append($$anchor, fragment_55);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_51);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_50);
																		},
																		$$slots: { default: true }
																	});
																});

																$.reset(div);
																$.append($$anchor, fragment_38);
															},
															$$slots: { default: true }
														});
													});

													var node_81 = $.sibling(node_52, 2);

													Separator(node_81, { class: '-mx-2 my-2 w-auto!' });

													var div_1 = $.sibling(node_81, 2);
													var node_82 = $.child(div_1);

													Button(node_82, {
														variant: 'ghost',
														size: 'sm',
														class: 'justify-start gap-1.5',
														children: ($$anchor, $$slotProps) => {
															var fragment_56 = root_14();
															var node_83 = $.first_child(fragment_56);

															IconPlaceholder(node_83, {
																lucide: 'MonitorIcon',
																tabler: 'IconDeviceDesktop',
																hugeicons: 'ComputerIcon',
																phosphor: 'MonitorIcon',
																remixicon: 'RiComputerLine',
																'data-icon': 'inline-start'
															});

															$.next();
															$.append($$anchor, fragment_56);
														},
														$$slots: { default: true }
													});

													var node_84 = $.sibling(node_82, 2);

													Button(node_84, {
														variant: 'ghost',
														size: 'sm',
														class: 'justify-start gap-1.5',
														children: ($$anchor, $$slotProps) => {
															var fragment_57 = root_15();
															var node_85 = $.first_child(fragment_57);

															IconPlaceholder(node_85, {
																lucide: 'DownloadIcon',
																tabler: 'IconDownload',
																hugeicons: 'DownloadIcon',
																phosphor: 'DownloadIcon',
																remixicon: 'RiDownloadLine',
																'data-icon': 'inline-start'
															});

															$.next();
															$.append($$anchor, fragment_57);
														},
														$$slots: { default: true }
													});

													$.reset(div_1);
													$.append($$anchor, fragment_30);
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
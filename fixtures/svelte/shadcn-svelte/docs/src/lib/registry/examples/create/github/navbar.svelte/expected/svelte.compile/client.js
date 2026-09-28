import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <span class="sr-only">Open menu</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<a><!> <!></a>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <div class="p-2"><!></div>`, 1);
var root_6 = $.from_html(`<!> Set status`, 1);
var root_7 = $.from_html(`<!> Single sign-on`, 1);
var root_8 = $.from_html(`<!> Profile`, 1);
var root_9 = $.from_html(`<!> Repositories`, 1);
var root_10 = $.from_html(`<!> Stars`, 1);
var root_11 = $.from_html(`<!> Gists`, 1);
var root_12 = $.from_html(`<!> Organizations`, 1);
var root_13 = $.from_html(`<!> Enterprises`, 1);
var root_14 = $.from_html(`<!> Sponsors`, 1);
var root_15 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_16 = $.from_html(`<!> Settings`, 1);
var root_17 = $.from_html(`<!> Copilot settings`, 1);
var root_18 = $.from_html(`<!> Feature preview`, 1);
var root_19 = $.from_html(`<!> Appearance`, 1);
var root_20 = $.from_html(`<!> Accessibility`, 1);
var root_21 = $.from_html(`<!> Upgrade`, 1);
var root_22 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_23 = $.from_html(`<!> Sign out`, 1);
var root_24 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_25 = $.from_html(`<header class="flex h-14 w-full items-center gap-2"><!> <!></header>`);

export default function Navbar($$anchor) {
	Example($$anchor, {
		title: 'Account Menu',
		children: ($$anchor, $$slotProps) => {
			var header = root_25();
			var node = $.child(header);

			$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					direction: 'left',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_2 = $.first_child(fragment_3);

										IconPlaceholder(node_2, {
											lucide: 'MenuIcon',
											hugeicons: 'Menu09Icon',
											tabler: 'IconMenu',
											phosphor: 'ListIcon',
											remixicon: 'RiMenuLine'
										});

										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
								Drawer_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Drawer.Content, ($$anchor, Drawer_Content) => {
							Drawer_Content($$anchor, {
								class: 'max-w-72',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_5();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => Drawer.Header, ($$anchor, Drawer_Header) => {
										Drawer_Header($$anchor, {
											class: 'flex flex-row items-center justify-between px-5 pb-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_2();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Drawer.Title, ($$anchor, Drawer_Title) => {
													Drawer_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Menu');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon-sm' }, props, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var node_7 = $.first_child(fragment_7);

																IconPlaceholder(node_7, {
																	lucide: 'XIcon',
																	tabler: 'IconX',
																	hugeicons: 'Cancel01Icon',
																	phosphor: 'XIcon',
																	remixicon: 'RiCloseLine'
																});

																$.next(2);
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_6, () => Drawer.Close, ($$anchor, Drawer_Close) => {
														Drawer_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var div = $.sibling(node_4, 2);
									var node_8 = $.child(div);

									$.component(node_8, () => Item.Group, ($$anchor, Item_Group) => {
										Item_Group($$anchor, {
											class: 'gap-px',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_4();
												var node_9 = $.first_child(fragment_8);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a = root_3();

														$.attribute_effect(a, () => ({ href: '#/', ...props() }));

														var node_10 = $.child(a);

														$.component(node_10, () => Item.Media, ($$anchor, Item_Media) => {
															Item_Media($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'HomeIcon',
																		tabler: 'IconHome',
																		hugeicons: 'HomeIcon',
																		phosphor: 'HouseIcon',
																		remixicon: 'RiHomeLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_11 = $.sibling(node_10, 2);

														$.component(node_11, () => Item.Content, ($$anchor, Item_Content) => {
															Item_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = $.comment();
																	var node_12 = $.first_child(fragment_10);

																	$.component(node_12, () => Item.Title, ($$anchor, Item_Title) => {
																		Item_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Home');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a);
														$.append($$anchor, a);
													};

													$.component(node_9, () => Item.Root, ($$anchor, Item_Root) => {
														Item_Root($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_13 = $.sibling(node_9, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_1 = root_3();

														$.attribute_effect(a_1, () => ({ href: '#/', ...props() }));

														var node_14 = $.child(a_1);

														$.component(node_14, () => Item.Media, ($$anchor, Item_Media_1) => {
															Item_Media_1($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'CircleIcon',
																		tabler: 'IconCircle',
																		hugeicons: 'CircleIcon',
																		phosphor: 'CircleIcon',
																		remixicon: 'RiCircleLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_15 = $.sibling(node_14, 2);

														$.component(node_15, () => Item.Content, ($$anchor, Item_Content_1) => {
															Item_Content_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_16 = $.first_child(fragment_12);

																	$.component(node_16, () => Item.Title, ($$anchor, Item_Title_1) => {
																		Item_Title_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text('Issues');

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

														$.reset(a_1);
														$.append($$anchor, a_1);
													};

													$.component(node_13, () => Item.Root, ($$anchor, Item_Root_1) => {
														Item_Root_1($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_17 = $.sibling(node_13, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_2 = root_3();

														$.attribute_effect(a_2, () => ({ href: '#/', ...props() }));

														var node_18 = $.child(a_2);

														$.component(node_18, () => Item.Media, ($$anchor, Item_Media_2) => {
															Item_Media_2($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'GitBranchIcon',
																		tabler: 'IconGitBranch',
																		hugeicons: 'GitBranchIcon',
																		phosphor: 'GitBranchIcon',
																		remixicon: 'RiGitBranchLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_19 = $.sibling(node_18, 2);

														$.component(node_19, () => Item.Content, ($$anchor, Item_Content_2) => {
															Item_Content_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = $.comment();
																	var node_20 = $.first_child(fragment_14);

																	$.component(node_20, () => Item.Title, ($$anchor, Item_Title_2) => {
																		Item_Title_2($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text('Pull requests');

																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_14);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_2);
														$.append($$anchor, a_2);
													};

													$.component(node_17, () => Item.Root, ($$anchor, Item_Root_2) => {
														Item_Root_2($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_21 = $.sibling(node_17, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_3 = root_3();

														$.attribute_effect(a_3, () => ({ href: '#/', ...props() }));

														var node_22 = $.child(a_3);

														$.component(node_22, () => Item.Media, ($$anchor, Item_Media_3) => {
															Item_Media_3($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'LayoutGridIcon',
																		tabler: 'IconLayoutGrid',
																		hugeicons: 'GridIcon',
																		phosphor: 'GridFourIcon',
																		remixicon: 'RiGridLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_23 = $.sibling(node_22, 2);

														$.component(node_23, () => Item.Content, ($$anchor, Item_Content_3) => {
															Item_Content_3($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_16 = $.comment();
																	var node_24 = $.first_child(fragment_16);

																	$.component(node_24, () => Item.Title, ($$anchor, Item_Title_3) => {
																		Item_Title_3($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text('Projects');

																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_16);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_3);
														$.append($$anchor, a_3);
													};

													$.component(node_21, () => Item.Root, ($$anchor, Item_Root_3) => {
														Item_Root_3($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_25 = $.sibling(node_21, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_4 = root_3();

														$.attribute_effect(a_4, () => ({ href: '#/', ...props() }));

														var node_26 = $.child(a_4);

														$.component(node_26, () => Item.Media, ($$anchor, Item_Media_4) => {
															Item_Media_4($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'MailIcon',
																		tabler: 'IconMail',
																		hugeicons: 'MailIcon',
																		phosphor: 'EnvelopeIcon',
																		remixicon: 'RiMailLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_27 = $.sibling(node_26, 2);

														$.component(node_27, () => Item.Content, ($$anchor, Item_Content_4) => {
															Item_Content_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_18 = $.comment();
																	var node_28 = $.first_child(fragment_18);

																	$.component(node_28, () => Item.Title, ($$anchor, Item_Title_4) => {
																		Item_Title_4($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Discussions');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_18);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_4);
														$.append($$anchor, a_4);
													};

													$.component(node_25, () => Item.Root, ($$anchor, Item_Root_4) => {
														Item_Root_4($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_29 = $.sibling(node_25, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_5 = root_3();

														$.attribute_effect(a_5, () => ({ href: '#/', ...props() }));

														var node_30 = $.child(a_5);

														$.component(node_30, () => Item.Media, ($$anchor, Item_Media_5) => {
															Item_Media_5($$anchor, {
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

														var node_31 = $.sibling(node_30, 2);

														$.component(node_31, () => Item.Content, ($$anchor, Item_Content_5) => {
															Item_Content_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_20 = $.comment();
																	var node_32 = $.first_child(fragment_20);

																	$.component(node_32, () => Item.Title, ($$anchor, Item_Title_5) => {
																		Item_Title_5($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text('Codespaces');

																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_20);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_5);
														$.append($$anchor, a_5);
													};

													$.component(node_29, () => Item.Root, ($$anchor, Item_Root_5) => {
														Item_Root_5($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_33 = $.sibling(node_29, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_6 = root_3();

														$.attribute_effect(a_6, () => ({ href: '#/', ...props() }));

														var node_34 = $.child(a_6);

														$.component(node_34, () => Item.Media, ($$anchor, Item_Media_6) => {
															Item_Media_6($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'BotIcon',
																		tabler: 'IconRobot',
																		hugeicons: 'RoboticIcon',
																		phosphor: 'RobotIcon',
																		remixicon: 'RiRobotLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_35 = $.sibling(node_34, 2);

														$.component(node_35, () => Item.Content, ($$anchor, Item_Content_6) => {
															Item_Content_6($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_22 = $.comment();
																	var node_36 = $.first_child(fragment_22);

																	$.component(node_36, () => Item.Title, ($$anchor, Item_Title_6) => {
																		Item_Title_6($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_7 = $.text('Copilot');

																				$.append($$anchor, text_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_22);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_6);
														$.append($$anchor, a_6);
													};

													$.component(node_33, () => Item.Root, ($$anchor, Item_Root_6) => {
														Item_Root_6($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_37 = $.sibling(node_33, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_7 = root_3();

														$.attribute_effect(a_7, () => ({ href: '#/', ...props() }));

														var node_38 = $.child(a_7);

														$.component(node_38, () => Item.Media, ($$anchor, Item_Media_7) => {
															Item_Media_7($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'SparklesIcon',
																		tabler: 'IconSparkles',
																		hugeicons: 'SparklesIcon',
																		phosphor: 'SparkleIcon',
																		remixicon: 'RiSparklingLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_39 = $.sibling(node_38, 2);

														$.component(node_39, () => Item.Content, ($$anchor, Item_Content_7) => {
															Item_Content_7($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_24 = $.comment();
																	var node_40 = $.first_child(fragment_24);

																	$.component(node_40, () => Item.Title, ($$anchor, Item_Title_7) => {
																		Item_Title_7($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_8 = $.text('Spark');

																				$.append($$anchor, text_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_24);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_7);
														$.append($$anchor, a_7);
													};

													$.component(node_37, () => Item.Root, ($$anchor, Item_Root_7) => {
														Item_Root_7($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_41 = $.sibling(node_37, 2);

												$.component(node_41, () => Item.Separator, ($$anchor, Item_Separator) => {
													Item_Separator($$anchor, {});
												});

												var node_42 = $.sibling(node_41, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_8 = root_3();

														$.attribute_effect(a_8, () => ({ href: '#/', ...props() }));

														var node_43 = $.child(a_8);

														$.component(node_43, () => Item.Media, ($$anchor, Item_Media_8) => {
															Item_Media_8($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'SearchIcon',
																		tabler: 'IconSearch',
																		hugeicons: 'SearchIcon',
																		phosphor: 'MagnifyingGlassIcon',
																		remixicon: 'RiSearchLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_44 = $.sibling(node_43, 2);

														$.component(node_44, () => Item.Content, ($$anchor, Item_Content_8) => {
															Item_Content_8($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_26 = $.comment();
																	var node_45 = $.first_child(fragment_26);

																	$.component(node_45, () => Item.Title, ($$anchor, Item_Title_8) => {
																		Item_Title_8($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text('Explore');

																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_26);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_8);
														$.append($$anchor, a_8);
													};

													$.component(node_42, () => Item.Root, ($$anchor, Item_Root_8) => {
														Item_Root_8($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_46 = $.sibling(node_42, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_9 = root_3();

														$.attribute_effect(a_9, () => ({ href: '#/', ...props() }));

														var node_47 = $.child(a_9);

														$.component(node_47, () => Item.Media, ($$anchor, Item_Media_9) => {
															Item_Media_9($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'ShoppingBagIcon',
																		tabler: 'IconShoppingBag',
																		hugeicons: 'ShoppingBasket01Icon',
																		phosphor: 'BagIcon',
																		remixicon: 'RiShoppingBagLine'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_48 = $.sibling(node_47, 2);

														$.component(node_48, () => Item.Content, ($$anchor, Item_Content_9) => {
															Item_Content_9($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_28 = $.comment();
																	var node_49 = $.first_child(fragment_28);

																	$.component(node_49, () => Item.Title, ($$anchor, Item_Title_9) => {
																		Item_Title_9($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_10 = $.text('Marketplace');

																				$.append($$anchor, text_10);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_28);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_9);
														$.append($$anchor, a_9);
													};

													$.component(node_46, () => Item.Root, ($$anchor, Item_Root_9) => {
														Item_Root_9($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												var node_50 = $.sibling(node_46, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a_10 = root_3();

														$.attribute_effect(a_10, () => ({ href: '#/', ...props() }));

														var node_51 = $.child(a_10);

														$.component(node_51, () => Item.Media, ($$anchor, Item_Media_10) => {
															Item_Media_10($$anchor, {
																variant: 'icon',
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'LinkIcon',
																		tabler: 'IconLink',
																		hugeicons: 'LinkIcon',
																		phosphor: 'LinkIcon',
																		remixicon: 'RiLink'
																	});
																},
																$$slots: { default: true }
															});
														});

														var node_52 = $.sibling(node_51, 2);

														$.component(node_52, () => Item.Content, ($$anchor, Item_Content_10) => {
															Item_Content_10($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_30 = $.comment();
																	var node_53 = $.first_child(fragment_30);

																	$.component(node_53, () => Item.Title, ($$anchor, Item_Title_10) => {
																		Item_Title_10($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_11 = $.text('MCP registry');

																				$.append($$anchor, text_11);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_30);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a_10);
														$.append($$anchor, a_10);
													};

													$.component(node_50, () => Item.Root, ($$anchor, Item_Root_10) => {
														Item_Root_10($$anchor, { size: 'xs', child, $$slots: { child: true } });
													});
												}

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_54 = $.sibling(node, 2);

			$.component(node_54, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_31 = root_2();
						var node_55 = $.first_child(fragment_31);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(
									{
										variant: 'ghost',
										size: 'icon',
										class: 'ml-auto rounded-full'
									},
									props,
									{
										children: ($$anchor, $$slotProps) => {
											var fragment_33 = $.comment();
											var node_56 = $.first_child(fragment_33);

											$.component(node_56, () => Avatar.Root, ($$anchor, Avatar_Root) => {
												Avatar_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_34 = root_2();
														var node_57 = $.first_child(fragment_34);

														$.component(node_57, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
														});

														var node_58 = $.sibling(node_57, 2);

														$.component(node_58, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
															Avatar_Fallback($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_12 = $.text('SC');

																	$.append($$anchor, text_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_34);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_33);
										},
										$$slots: { default: true }
									}
								));
							};

							$.component(node_55, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_59 = $.sibling(node_55, 2);

						$.component(node_59, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'w-56',
								align: 'end',
								children: ($$anchor, $$slotProps) => {
									var fragment_35 = root_24();
									var node_60 = $.first_child(fragment_35);

									$.component(node_60, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_36 = $.comment();
												var node_61 = $.first_child(fragment_36);

												$.component(node_61, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														class: 'p-0 font-normal',
														children: ($$anchor, $$slotProps) => {
															var fragment_37 = $.comment();
															var node_62 = $.first_child(fragment_37);

															$.component(node_62, () => Item.Root, ($$anchor, Item_Root_11) => {
																Item_Root_11($$anchor, {
																	class: 'px-2 py-1 pb-0.5',
																	size: 'sm',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_38 = root_2();
																		var node_63 = $.first_child(fragment_38);

																		$.component(node_63, () => Item.Media, ($$anchor, Item_Media_11) => {
																			Item_Media_11($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_39 = $.comment();
																					var node_64 = $.first_child(fragment_39);

																					$.component(node_64, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																						Avatar_Root_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_40 = root_2();
																								var node_65 = $.first_child(fragment_40);

																								$.component(node_65, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																									Avatar_Image_1($$anchor, { src: 'https://github.com/shadcn.png', alt: 'shadcn' });
																								});

																								var node_66 = $.sibling(node_65, 2);

																								$.component(node_66, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																									Avatar_Fallback_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_13 = $.text('SC');

																											$.append($$anchor, text_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_40);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_39);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_67 = $.sibling(node_63, 2);

																		$.component(node_67, () => Item.Content, ($$anchor, Item_Content_11) => {
																			Item_Content_11($$anchor, {
																				class: 'gap-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_41 = root_2();
																					var node_68 = $.first_child(fragment_41);

																					$.component(node_68, () => Item.Title, ($$anchor, Item_Title_11) => {
																						Item_Title_11($$anchor, {
																							class: 'text-sm text-foreground',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_14 = $.text('shadcn');

																								$.append($$anchor, text_14);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_69 = $.sibling(node_68, 2);

																					$.component(node_69, () => Item.Description, ($$anchor, Item_Description) => {
																						Item_Description($$anchor, {
																							class: 'text-xs',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_15 = $.text('shadcn@example.com');

																								$.append($$anchor, text_15);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_41);
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

												$.append($$anchor, fragment_36);
											},
											$$slots: { default: true }
										});
									});

									var node_70 = $.sibling(node_60, 2);

									$.component(node_70, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_71 = $.sibling(node_70, 2);

									$.component(node_71, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
										DropdownMenu_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_42 = root_2();
												var node_72 = $.first_child(fragment_42);

												$.component(node_72, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_43 = root_6();
															var node_73 = $.first_child(fragment_43);

															IconPlaceholder(node_73, {
																lucide: 'SmileIcon',
																tabler: 'IconMoodSmile',
																hugeicons: 'SmileIcon',
																phosphor: 'SmileyIcon',
																remixicon: 'RiEmotionLine'
															});

															$.next();
															$.append($$anchor, fragment_43);
														},
														$$slots: { default: true }
													});
												});

												var node_74 = $.sibling(node_72, 2);

												$.component(node_74, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_44 = root_7();
															var node_75 = $.first_child(fragment_44);

															IconPlaceholder(node_75, {
																lucide: 'CircleAlertIcon',
																tabler: 'IconExclamationCircle',
																hugeicons: 'AlertCircleIcon',
																phosphor: 'WarningCircleIcon',
																remixicon: 'RiErrorWarningLine'
															});

															$.next();
															$.append($$anchor, fragment_44);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_42);
											},
											$$slots: { default: true }
										});
									});

									var node_76 = $.sibling(node_71, 2);

									$.component(node_76, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
										DropdownMenu_Separator_1($$anchor, {});
									});

									var node_77 = $.sibling(node_76, 2);

									$.component(node_77, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
										DropdownMenu_Group_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_45 = root_15();
												var node_78 = $.first_child(fragment_45);

												$.component(node_78, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
													DropdownMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_46 = root_8();
															var node_79 = $.first_child(fragment_46);

															IconPlaceholder(node_79, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															$.next();
															$.append($$anchor, fragment_46);
														},
														$$slots: { default: true }
													});
												});

												var node_80 = $.sibling(node_78, 2);

												$.component(node_80, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
													DropdownMenu_Item_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_47 = root_9();
															var node_81 = $.first_child(fragment_47);

															IconPlaceholder(node_81, {
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															$.next();
															$.append($$anchor, fragment_47);
														},
														$$slots: { default: true }
													});
												});

												var node_82 = $.sibling(node_80, 2);

												$.component(node_82, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
													DropdownMenu_Item_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_48 = root_10();
															var node_83 = $.first_child(fragment_48);

															IconPlaceholder(node_83, {
																lucide: 'StarIcon',
																tabler: 'IconStar',
																hugeicons: 'StarIcon',
																phosphor: 'StarIcon',
																remixicon: 'RiStarLine'
															});

															$.next();
															$.append($$anchor, fragment_48);
														},
														$$slots: { default: true }
													});
												});

												var node_84 = $.sibling(node_82, 2);

												$.component(node_84, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
													DropdownMenu_Item_5($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_49 = root_11();
															var node_85 = $.first_child(fragment_49);

															IconPlaceholder(node_85, {
																lucide: 'CodeIcon',
																tabler: 'IconCode',
																hugeicons: 'CodeIcon',
																phosphor: 'CodeIcon',
																remixicon: 'RiCodeLine'
															});

															$.next();
															$.append($$anchor, fragment_49);
														},
														$$slots: { default: true }
													});
												});

												var node_86 = $.sibling(node_84, 2);

												$.component(node_86, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
													DropdownMenu_Item_6($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_50 = root_12();
															var node_87 = $.first_child(fragment_50);

															IconPlaceholder(node_87, {
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															$.next();
															$.append($$anchor, fragment_50);
														},
														$$slots: { default: true }
													});
												});

												var node_88 = $.sibling(node_86, 2);

												$.component(node_88, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
													DropdownMenu_Item_7($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_51 = root_13();
															var node_89 = $.first_child(fragment_51);

															IconPlaceholder(node_89, {
																lucide: 'ServerIcon',
																tabler: 'IconServer',
																hugeicons: 'ServerStackIcon',
																phosphor: 'HardDrivesIcon',
																remixicon: 'RiServerLine'
															});

															$.next();
															$.append($$anchor, fragment_51);
														},
														$$slots: { default: true }
													});
												});

												var node_90 = $.sibling(node_88, 2);

												$.component(node_90, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
													DropdownMenu_Item_8($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_52 = root_14();
															var node_91 = $.first_child(fragment_52);

															IconPlaceholder(node_91, {
																lucide: 'HeartIcon',
																tabler: 'IconHeart',
																hugeicons: 'FavouriteIcon',
																phosphor: 'HeartIcon',
																remixicon: 'RiHeartLine'
															});

															$.next();
															$.append($$anchor, fragment_52);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_45);
											},
											$$slots: { default: true }
										});
									});

									var node_92 = $.sibling(node_77, 2);

									$.component(node_92, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
										DropdownMenu_Separator_2($$anchor, {});
									});

									var node_93 = $.sibling(node_92, 2);

									$.component(node_93, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
										DropdownMenu_Group_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_53 = root_22();
												var node_94 = $.first_child(fragment_53);

												$.component(node_94, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
													DropdownMenu_Item_9($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_54 = root_16();
															var node_95 = $.first_child(fragment_54);

															IconPlaceholder(node_95, {
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
															});

															$.next();
															$.append($$anchor, fragment_54);
														},
														$$slots: { default: true }
													});
												});

												var node_96 = $.sibling(node_94, 2);

												$.component(node_96, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
													DropdownMenu_Item_10($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_55 = root_17();
															var node_97 = $.first_child(fragment_55);

															IconPlaceholder(node_97, {
																lucide: 'BotIcon',
																tabler: 'IconRobot',
																hugeicons: 'RoboticIcon',
																phosphor: 'RobotIcon',
																remixicon: 'RiRobotLine'
															});

															$.next();
															$.append($$anchor, fragment_55);
														},
														$$slots: { default: true }
													});
												});

												var node_98 = $.sibling(node_96, 2);

												$.component(node_98, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
													DropdownMenu_Item_11($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_56 = root_18();
															var node_99 = $.first_child(fragment_56);

															IconPlaceholder(node_99, {
																lucide: 'SparklesIcon',
																tabler: 'IconSparkles',
																hugeicons: 'SparklesIcon',
																phosphor: 'SparkleIcon',
																remixicon: 'RiSparklingLine'
															});

															$.next();
															$.append($$anchor, fragment_56);
														},
														$$slots: { default: true }
													});
												});

												var node_100 = $.sibling(node_98, 2);

												$.component(node_100, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_12) => {
													DropdownMenu_Item_12($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_57 = root_19();
															var node_101 = $.first_child(fragment_57);

															IconPlaceholder(node_101, {
																lucide: 'MonitorIcon',
																tabler: 'IconDeviceDesktop',
																hugeicons: 'ComputerIcon',
																phosphor: 'MonitorIcon',
																remixicon: 'RiComputerLine'
															});

															$.next();
															$.append($$anchor, fragment_57);
														},
														$$slots: { default: true }
													});
												});

												var node_102 = $.sibling(node_100, 2);

												$.component(node_102, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_13) => {
													DropdownMenu_Item_13($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_58 = root_20();
															var node_103 = $.first_child(fragment_58);

															IconPlaceholder(node_103, {
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															$.next();
															$.append($$anchor, fragment_58);
														},
														$$slots: { default: true }
													});
												});

												var node_104 = $.sibling(node_102, 2);

												$.component(node_104, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_14) => {
													DropdownMenu_Item_14($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_59 = root_21();
															var node_105 = $.first_child(fragment_59);

															IconPlaceholder(node_105, {
																lucide: 'ArrowUpIcon',
																tabler: 'IconArrowUp',
																hugeicons: 'ArrowUpIcon',
																phosphor: 'ArrowUpIcon',
																remixicon: 'RiArrowUpLine'
															});

															$.next();
															$.append($$anchor, fragment_59);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_53);
											},
											$$slots: { default: true }
										});
									});

									var node_106 = $.sibling(node_93, 2);

									$.component(node_106, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
										DropdownMenu_Separator_3($$anchor, {});
									});

									var node_107 = $.sibling(node_106, 2);

									$.component(node_107, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_15) => {
										DropdownMenu_Item_15($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_60 = root_23();
												var node_108 = $.first_child(fragment_60);

												IconPlaceholder(node_108, {
													lucide: 'LogOutIcon',
													tabler: 'IconLogout',
													hugeicons: 'LogoutIcon',
													phosphor: 'SignOutIcon',
													remixicon: 'RiLogoutBoxLine'
												});

												$.next();
												$.append($$anchor, fragment_60);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_35);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_31);
					},
					$$slots: { default: true }
				});
			});

			$.reset(header);
			$.append($$anchor, header);
		},
		$$slots: { default: true }
	});
}
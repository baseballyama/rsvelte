import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span class="sr-only">Account options</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<a><!> <!> <!></a>`);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Payments($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex flex-col gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
								Breadcrumb_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
											Breadcrumb_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_3();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
														Breadcrumb_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_5 = $.first_child(fragment_5);

																$.component(node_5, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
																	Breadcrumb_Link($$anchor, {
																		href: '#/',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Home');

																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_4, 2);

													$.component(node_6, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
														Breadcrumb_Separator($$anchor, {});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
														Breadcrumb_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																	DropdownMenu_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root_2();
																			var node_9 = $.first_child(fragment_7);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;

																					Button($$anchor, $.spread_props({ size: 'icon-sm', variant: 'ghost' }, props, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_9 = root();
																							var node_10 = $.first_child(fragment_9);

																							IconPlaceholder(node_10, {
																								lucide: 'MoreHorizontalIcon',
																								tabler: 'IconDots',
																								hugeicons: 'MoreHorizontalCircle01Icon',
																								phosphor: 'DotsThreeIcon',
																								remixicon: 'RiMoreLine'
																							});

																							$.next(2);
																							$.append($$anchor, fragment_9);
																						},
																						$$slots: { default: true }
																					}));
																				};

																				$.component(node_9, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																					DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																				});
																			}

																			var node_11 = $.sibling(node_9, 2);

																			$.component(node_11, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																				DropdownMenu_Content($$anchor, {
																					align: 'start',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = $.comment();
																						var node_12 = $.first_child(fragment_10);

																						$.component(node_12, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																							DropdownMenu_Group($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_11 = root_1();
																									var node_13 = $.first_child(fragment_11);

																									$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																										DropdownMenu_Item($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_1 = $.text('Profile');

																												$.append($$anchor, text_1);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_14 = $.sibling(node_13, 2);

																									$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																										DropdownMenu_Item_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text('Statements');

																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_15 = $.sibling(node_14, 2);

																									$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																										DropdownMenu_Item_2($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_3 = $.text('Documents');

																												$.append($$anchor, text_3);
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

													var node_16 = $.sibling(node_7, 2);

													$.component(node_16, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_1) => {
														Breadcrumb_Separator_1($$anchor, {});
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_2) => {
														Breadcrumb_Item_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_18 = $.first_child(fragment_12);

																$.component(node_18, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
																	Breadcrumb_Page($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Payments');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_12);
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

				var node_19 = $.sibling(node_1, 2);

				$.component(node_19, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_20 = $.first_child(fragment_13);

							$.component(node_20, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_5();
										var node_21 = $.first_child(fragment_14);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var a = root_4();

												$.attribute_effect(a, () => ({ href: '#/', ...props() }));

												var node_22 = $.child(a);

												$.component(node_22, () => Item.Media, ($$anchor, Item_Media) => {
													Item_Media($$anchor, {
														variant: 'icon',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'GaugeIcon',
																tabler: 'IconGauge',
																hugeicons: 'Settings01Icon',
																phosphor: 'GaugeIcon',
																remixicon: 'RiDashboardLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Item.Content, ($$anchor, Item_Content) => {
													Item_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root_2();
															var node_24 = $.first_child(fragment_16);

															$.component(node_24, () => Item.Title, ($$anchor, Item_Title) => {
																Item_Title($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('Change transfer limit');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															var node_25 = $.sibling(node_24, 2);

															$.component(node_25, () => Item.Description, ($$anchor, Item_Description) => {
																Item_Description($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Adjust how much you can send from your balance.');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});

												var node_26 = $.sibling(node_23, 2);

												IconPlaceholder(node_26, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$.reset(a);
												$.append($$anchor, a);
											};

											$.component(node_21, () => Item.Root, ($$anchor, Item_Root) => {
												Item_Root($$anchor, { variant: 'muted', child, $$slots: { child: true } });
											});
										}

										var node_27 = $.sibling(node_21, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var a_1 = root_4();

												$.attribute_effect(a_1, () => ({ href: '#/', ...props() }));

												var node_28 = $.child(a_1);

												$.component(node_28, () => Item.Media, ($$anchor, Item_Media_1) => {
													Item_Media_1($$anchor, {
														variant: 'icon',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'CalendarIcon',
																tabler: 'IconCalendar',
																hugeicons: 'Calendar03Icon',
																phosphor: 'CalendarIcon',
																remixicon: 'RiCalendarLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_29 = $.sibling(node_28, 2);

												$.component(node_29, () => Item.Content, ($$anchor, Item_Content_1) => {
													Item_Content_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root_2();
															var node_30 = $.first_child(fragment_18);

															$.component(node_30, () => Item.Title, ($$anchor, Item_Title_1) => {
																Item_Title_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Scheduled transfers');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_30, 2);

															$.component(node_31, () => Item.Description, ($$anchor, Item_Description_1) => {
																Item_Description_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Set up a transfer to send at a later date.');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_29, 2);

												IconPlaceholder(node_32, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$.reset(a_1);
												$.append($$anchor, a_1);
											};

											$.component(node_27, () => Item.Root, ($$anchor, Item_Root_1) => {
												Item_Root_1($$anchor, { variant: 'muted', child, $$slots: { child: true } });
											});
										}

										var node_33 = $.sibling(node_27, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var a_2 = root_4();

												$.attribute_effect(a_2, () => ({ href: '#/', ...props() }));

												var node_34 = $.child(a_2);

												$.component(node_34, () => Item.Media, ($$anchor, Item_Media_2) => {
													Item_Media_2($$anchor, {
														variant: 'icon',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'RepeatIcon',
																tabler: 'IconRepeat',
																hugeicons: 'RepeatIcon',
																phosphor: 'RepeatIcon',
																remixicon: 'RiRepeatLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_35 = $.sibling(node_34, 2);

												$.component(node_35, () => Item.Content, ($$anchor, Item_Content_2) => {
													Item_Content_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root_2();
															var node_36 = $.first_child(fragment_20);

															$.component(node_36, () => Item.Title, ($$anchor, Item_Title_2) => {
																Item_Title_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Direct Debits');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_37 = $.sibling(node_36, 2);

															$.component(node_37, () => Item.Description, ($$anchor, Item_Description_2) => {
																Item_Description_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Set up and manage regular payments.');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_20);
														},
														$$slots: { default: true }
													});
												});

												var node_38 = $.sibling(node_35, 2);

												IconPlaceholder(node_38, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$.reset(a_2);
												$.append($$anchor, a_2);
											};

											$.component(node_33, () => Item.Root, ($$anchor, Item_Root_2) => {
												Item_Root_2($$anchor, { variant: 'muted', child, $$slots: { child: true } });
											});
										}

										var node_39 = $.sibling(node_33, 2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var a_3 = root_4();

												$.attribute_effect(a_3, () => ({ href: '#/', ...props() }));

												var node_40 = $.child(a_3);

												$.component(node_40, () => Item.Media, ($$anchor, Item_Media_3) => {
													Item_Media_3($$anchor, {
														variant: 'icon',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'RefreshCwIcon',
																tabler: 'IconRefresh',
																hugeicons: 'RepeatIcon',
																phosphor: 'ArrowsClockwiseIcon',
																remixicon: 'RiRefreshLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_41 = $.sibling(node_40, 2);

												$.component(node_41, () => Item.Content, ($$anchor, Item_Content_3) => {
													Item_Content_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root_2();
															var node_42 = $.first_child(fragment_22);

															$.component(node_42, () => Item.Title, ($$anchor, Item_Title_3) => {
																Item_Title_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Recurring card payments');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_43 = $.sibling(node_42, 2);

															$.component(node_43, () => Item.Description, ($$anchor, Item_Description_3) => {
																Item_Description_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_12 = $.text('Manage your repeated card transactions.');

																		$.append($$anchor, text_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												var node_44 = $.sibling(node_41, 2);

												IconPlaceholder(node_44, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'size-4 shrink-0 text-muted-foreground'
												});

												$.reset(a_3);
												$.append($$anchor, a_3);
											};

											$.component(node_39, () => Item.Root, ($$anchor, Item_Root_3) => {
												Item_Root_3($$anchor, { variant: 'muted', child, $$slots: { child: true } });
											});
										}

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
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
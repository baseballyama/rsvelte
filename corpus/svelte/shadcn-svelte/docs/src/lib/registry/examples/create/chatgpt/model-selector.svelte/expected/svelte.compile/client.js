import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`ChatGPT 5.1 <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="font-medium">Legacy models</span>`);

export default function Model_selector($$anchor, $$props) {
	$.push($$props, true);

	let mode = $.state("auto");
	let model = $.state("gpt-5.1");

	Example($$anchor, {
		title: 'Model Selector',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2"));

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var node_2 = $.sibling($.first_child(fragment_3));

										IconPlaceholder(node_2, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											class: 'size-4 text-muted-foreground'
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'w-60',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_2();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														class: 'text-xs font-normal text-muted-foreground',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('GPT-5.1');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
													DropdownMenu_RadioGroup($$anchor, {
														get value() {
															return $.get(mode);
														},

														set value($$value) {
															$.set(mode, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																DropdownMenu_RadioItem($$anchor, {
																	value: 'auto',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = $.comment();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Item.Root, ($$anchor, Item_Root) => {
																			Item_Root($$anchor, {
																				size: 'xs',
																				class: 'p-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = $.comment();
																					var node_9 = $.first_child(fragment_8);

																					$.component(node_9, () => Item.Content, ($$anchor, Item_Content) => {
																						Item_Content($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_9 = root_1();
																								var node_10 = $.first_child(fragment_9);

																								$.component(node_10, () => Item.Title, ($$anchor, Item_Title) => {
																									Item_Title($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_1 = $.text('Auto');

																											$.append($$anchor, text_1);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_11 = $.sibling(node_10, 2);

																								$.component(node_11, () => Item.Description, ($$anchor, Item_Description) => {
																									Item_Description($$anchor, {
																										class: 'text-xs',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_2 = $.text('Decides how long to think');

																											$.append($$anchor, text_2);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_9);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_7, 2);

															$.component(node_12, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																DropdownMenu_RadioItem_1($$anchor, {
																	value: 'instant',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_13 = $.first_child(fragment_10);

																		$.component(node_13, () => Item.Root, ($$anchor, Item_Root_1) => {
																			Item_Root_1($$anchor, {
																				size: 'xs',
																				class: 'p-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = $.comment();
																					var node_14 = $.first_child(fragment_11);

																					$.component(node_14, () => Item.Content, ($$anchor, Item_Content_1) => {
																						Item_Content_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root_1();
																								var node_15 = $.first_child(fragment_12);

																								$.component(node_15, () => Item.Title, ($$anchor, Item_Title_1) => {
																									Item_Title_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text('Instant');

																											$.append($$anchor, text_3);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_16 = $.sibling(node_15, 2);

																								$.component(node_16, () => Item.Description, ($$anchor, Item_Description_1) => {
																									Item_Description_1($$anchor, {
																										class: 'text-xs',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text('Answers right away');

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

															var node_17 = $.sibling(node_12, 2);

															$.component(node_17, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																DropdownMenu_RadioItem_2($$anchor, {
																	value: 'thinking',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = $.comment();
																		var node_18 = $.first_child(fragment_13);

																		$.component(node_18, () => Item.Root, ($$anchor, Item_Root_2) => {
																			Item_Root_2($$anchor, {
																				size: 'xs',
																				class: 'p-0',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = $.comment();
																					var node_19 = $.first_child(fragment_14);

																					$.component(node_19, () => Item.Content, ($$anchor, Item_Content_2) => {
																						Item_Content_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_15 = root_1();
																								var node_20 = $.first_child(fragment_15);

																								$.component(node_20, () => Item.Title, ($$anchor, Item_Title_2) => {
																									Item_Title_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('Thinking');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_21 = $.sibling(node_20, 2);

																								$.component(node_21, () => Item.Description, ($$anchor, Item_Description_2) => {
																									Item_Description_2($$anchor, {
																										class: 'text-xs',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_6 = $.text('Thinks longer for better answers');

																											$.append($$anchor, text_6);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_15);
																							},
																							$$slots: { default: true }
																						});
																					});

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

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_22 = $.sibling(node_4, 2);

									$.component(node_22, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
										DropdownMenu_Sub($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_1();
												var node_24 = $.first_child(fragment_16);

												$.component(node_24, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
													DropdownMenu_SubTrigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var span = root_3();

															$.append($$anchor, span);
														},
														$$slots: { default: true }
													});
												});

												var node_25 = $.sibling(node_24, 2);

												$.component(node_25, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
													DropdownMenu_Portal($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = $.comment();
															var node_26 = $.first_child(fragment_17);

															$.component(node_26, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																DropdownMenu_SubContent($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = $.comment();
																		var node_27 = $.first_child(fragment_18);

																		$.component(node_27, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																			DropdownMenu_Group_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_19 = $.comment();
																					var node_28 = $.first_child(fragment_19);

																					$.component(node_28, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_1) => {
																						DropdownMenu_RadioGroup_1($$anchor, {
																							get value() {
																								return $.get(model);
																							},

																							set value($$value) {
																								$.set(model, $$value, true);
																							},

																							children: ($$anchor, $$slotProps) => {
																								var fragment_20 = root_2();
																								var node_29 = $.first_child(fragment_20);

																								$.component(node_29, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_3) => {
																									DropdownMenu_RadioItem_3($$anchor, {
																										value: 'gpt-4',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_7 = $.text('GPT-4');

																											$.append($$anchor, text_7);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_30 = $.sibling(node_29, 2);

																								$.component(node_30, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_4) => {
																									DropdownMenu_RadioItem_4($$anchor, {
																										value: 'gpt-4-turbo',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text('GPT-4 Turbo');

																											$.append($$anchor, text_8);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_31 = $.sibling(node_30, 2);

																								$.component(node_31, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_5) => {
																									DropdownMenu_RadioItem_5($$anchor, {
																										value: 'gpt-3.5',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_9 = $.text('GPT-3.5');

																											$.append($$anchor, text_9);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_20);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_19);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_18);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
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

	$.pop();
}
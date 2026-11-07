import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Add files and more <!>`, 1);
var root_1 = $.from_html(`<!> Add photos & files`, 1);
var root_2 = $.from_html(`<!> Deep research`, 1);
var root_3 = $.from_html(`<!> Shopping research`, 1);
var root_4 = $.from_html(`<!> Create image`, 1);
var root_5 = $.from_html(`<!> Agent mode`, 1);
var root_6 = $.from_html(`<div class="font-medium">35 left</div> <div class="text-xs text-primary-foreground/80">More available for purchase</div>`, 1);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> More`, 1);
var root_10 = $.from_html(`<!> Add sources`, 1);
var root_11 = $.from_html(`<!> Study and learn`, 1);
var root_12 = $.from_html(`<!> Web search`, 1);
var root_13 = $.from_html(`<!> Canvas`, 1);
var root_14 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_15 = $.from_html(`<!> <!> <!>`, 1);

export default function Prompt_form($$anchor) {
	let dictateEnabled = $.state(false);

	Example($$anchor, {
		title: 'Prompt Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_7();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'prompt',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Prompt');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
							InputGroup_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_7();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
										InputGroup_Textarea($$anchor, { id: 'prompt', placeholder: 'Ask anything' });
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
										InputGroup_Addon($$anchor, {
											align: 'block-end',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_15();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
													Tooltip_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																DropdownMenu_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root_15();
																		var node_7 = $.first_child(fragment_6);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_7 = $.comment();
																				var node_8 = $.first_child(fragment_7);

																				{
																					const child = ($$anchor, $$arg0) => {
																						let triggerProps = () => ($$arg0?.()).props;
																						var fragment_8 = $.comment();
																						var node_9 = $.first_child(fragment_8);

																						$.component(node_9, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																							InputGroup_Button($$anchor, $.spread_props(
																								{
																									variant: 'ghost',
																									size: 'icon-sm',
																									onclick: () => $.set(dictateEnabled, !$.get(dictateEnabled)),
																									class: 'rounded-4xl'
																								},
																								props,
																								triggerProps,
																								{
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
																								}
																							));
																						});

																						$.append($$anchor, fragment_8);
																					};

																					$.component(node_8, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																					});
																				}

																				$.append($$anchor, fragment_7);
																			};

																			$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																				Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_10 = $.sibling(node_7, 2);

																		$.component(node_10, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																			Tooltip_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_10 = root();
																					var node_11 = $.sibling($.first_child(fragment_10));

																					$.component(node_11, () => Kbd.Root, ($$anchor, Kbd_Root) => {
																						Kbd_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_1 = $.text('/');

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

																		var node_12 = $.sibling(node_10, 2);

																		$.component(node_12, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																			DropdownMenu_Content($$anchor, {
																				class: 'w-56',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_7();
																					var node_13 = $.first_child(fragment_11);

																					$.component(node_13, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																						DropdownMenu_Group($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root_8();
																								var node_14 = $.first_child(fragment_12);

																								$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																									DropdownMenu_Item($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root_1();
																											var node_15 = $.first_child(fragment_13);

																											IconPlaceholder(node_15, {
																												lucide: 'PaperclipIcon',
																												tabler: 'IconPaperclip',
																												hugeicons: 'AttachmentIcon',
																												phosphor: 'PaperclipIcon',
																												remixicon: 'RiAttachmentLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_16 = $.sibling(node_14, 2);

																								$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																									DropdownMenu_Item_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_14 = root_2();
																											var node_17 = $.first_child(fragment_14);

																											IconPlaceholder(node_17, {
																												lucide: 'SparklesIcon',
																												tabler: 'IconSparkles',
																												hugeicons: 'SparklesIcon',
																												phosphor: 'SparkleIcon',
																												remixicon: 'RiSparklingLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_14);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_18 = $.sibling(node_16, 2);

																								$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																									DropdownMenu_Item_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_15 = root_3();
																											var node_19 = $.first_child(fragment_15);

																											IconPlaceholder(node_19, {
																												lucide: 'ShoppingBagIcon',
																												tabler: 'IconShoppingBag',
																												hugeicons: 'ShoppingBag01Icon',
																												phosphor: 'BagIcon',
																												remixicon: 'RiShoppingBagLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_15);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_20 = $.sibling(node_18, 2);

																								$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																									DropdownMenu_Item_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_16 = root_4();
																											var node_21 = $.first_child(fragment_16);

																											IconPlaceholder(node_21, {
																												lucide: 'WandIcon',
																												tabler: 'IconWand',
																												hugeicons: 'MagicWand05Icon',
																												phosphor: 'MagicWandIcon',
																												remixicon: 'RiMagicLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_16);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_20, 2);

																								$.component(node_22, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																									Tooltip_Root_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_17 = root_7();
																											var node_23 = $.first_child(fragment_17);

																											{
																												const child = ($$anchor, $$arg0) => {
																													let props = () => ($$arg0?.()).props;
																													var fragment_18 = $.comment();
																													var node_24 = $.first_child(fragment_18);

																													$.component(node_24, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																														DropdownMenu_Item_4($$anchor, $.spread_props(props, {
																															children: ($$anchor, $$slotProps) => {
																																var fragment_19 = root_5();
																																var node_25 = $.first_child(fragment_19);

																																IconPlaceholder(node_25, {
																																	lucide: 'MousePointerIcon',
																																	tabler: 'IconPointer',
																																	hugeicons: 'Cursor01Icon',
																																	phosphor: 'HandPointingIcon',
																																	remixicon: 'RiCursorLine'
																																});

																																$.next();
																																$.append($$anchor, fragment_19);
																															},
																															$$slots: { default: true }
																														}));
																													});

																													$.append($$anchor, fragment_18);
																												};

																												$.component(node_23, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																													Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
																												});
																											}

																											var node_26 = $.sibling(node_23, 2);

																											$.component(node_26, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																												Tooltip_Content_1($$anchor, {
																													side: 'right',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_20 = root_6();

																														$.next(2);
																														$.append($$anchor, fragment_20);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_17);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_27 = $.sibling(node_13, 2);

																					$.component(node_27, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
																						DropdownMenu_Sub($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_21 = root_7();
																								var node_28 = $.first_child(fragment_21);

																								$.component(node_28, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																									DropdownMenu_SubTrigger($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_22 = root_9();
																											var node_29 = $.first_child(fragment_22);

																											IconPlaceholder(node_29, {
																												lucide: 'MoreHorizontalIcon',
																												tabler: 'IconDots',
																												hugeicons: 'MoreHorizontalCircle01Icon',
																												phosphor: 'DotsThreeOutlineIcon',
																												remixicon: 'RiMoreLine'
																											});

																											$.next();
																											$.append($$anchor, fragment_22);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_30 = $.sibling(node_28, 2);

																								$.component(node_30, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
																									DropdownMenu_Portal($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_23 = $.comment();
																											var node_31 = $.first_child(fragment_23);

																											$.component(node_31, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																												DropdownMenu_SubContent($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_24 = $.comment();
																														var node_32 = $.first_child(fragment_24);

																														$.component(node_32, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																															DropdownMenu_Group_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_25 = root_14();
																																	var node_33 = $.first_child(fragment_25);

																																	$.component(node_33, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																																		DropdownMenu_Item_5($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_26 = root_10();
																																				var node_34 = $.first_child(fragment_26);

																																				IconPlaceholder(node_34, {
																																					lucide: 'ShareIcon',
																																					tabler: 'IconShare',
																																					hugeicons: 'Share03Icon',
																																					phosphor: 'ShareIcon',
																																					remixicon: 'RiShareLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_26);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_35 = $.sibling(node_33, 2);

																																	$.component(node_35, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																																		DropdownMenu_Item_6($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_27 = root_11();
																																				var node_36 = $.first_child(fragment_27);

																																				IconPlaceholder(node_36, {
																																					lucide: 'BookOpenIcon',
																																					tabler: 'IconBook',
																																					hugeicons: 'BookIcon',
																																					phosphor: 'BookOpenIcon',
																																					remixicon: 'RiBookOpenLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_27);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_37 = $.sibling(node_35, 2);

																																	$.component(node_37, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																																		DropdownMenu_Item_7($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_28 = root_12();
																																				var node_38 = $.first_child(fragment_28);

																																				IconPlaceholder(node_38, {
																																					lucide: 'GlobeIcon',
																																					tabler: 'IconWorld',
																																					hugeicons: 'GlobalIcon',
																																					phosphor: 'GlobeIcon',
																																					remixicon: 'RiGlobalLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_28);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_39 = $.sibling(node_37, 2);

																																	$.component(node_39, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																																		DropdownMenu_Item_8($$anchor, {
																																			children: ($$anchor, $$slotProps) => {
																																				var fragment_29 = root_13();
																																				var node_40 = $.first_child(fragment_29);

																																				IconPlaceholder(node_40, {
																																					lucide: 'PenToolIcon',
																																					tabler: 'IconPencil',
																																					hugeicons: 'PenIcon',
																																					phosphor: 'PencilIcon',
																																					remixicon: 'RiPencilLine'
																																				});

																																				$.next();
																																				$.append($$anchor, fragment_29);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	$.append($$anchor, fragment_25);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_24);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_23);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_21);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
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

												var node_41 = $.sibling(node_5, 2);

												$.component(node_41, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
													Tooltip_Root_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_30 = root_7();
															var node_42 = $.first_child(fragment_30);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;
																	var fragment_31 = $.comment();
																	var node_43 = $.first_child(fragment_31);

																	$.component(node_43, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																		InputGroup_Button_1($$anchor, $.spread_props(
																			{
																				variant: 'ghost',
																				size: 'icon-sm',
																				onclick: () => $.set(dictateEnabled, !$.get(dictateEnabled)),
																				class: 'ml-auto rounded-4xl'
																			},
																			props,
																			{
																				children: ($$anchor, $$slotProps) => {
																					IconPlaceholder($$anchor, {
																						lucide: 'AudioLinesIcon',
																						tabler: 'IconMicrophone',
																						hugeicons: 'AudioWave01Icon',
																						phosphor: 'MicrophoneIcon',
																						remixicon: 'RiMicLine'
																					});
																				},
																				$$slots: { default: true }
																			}
																		));
																	});

																	$.append($$anchor, fragment_31);
																};

																$.component(node_42, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																	Tooltip_Trigger_2($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_44 = $.sibling(node_42, 2);

															$.component(node_44, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																Tooltip_Content_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Dictate');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_30);
														},
														$$slots: { default: true }
													});
												});

												var node_45 = $.sibling(node_41, 2);

												$.component(node_45, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
													InputGroup_Button_2($$anchor, {
														size: 'icon-sm',
														variant: 'default',
														class: 'rounded-4xl',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'ArrowUpIcon',
																tabler: 'IconArrowUp',
																hugeicons: 'ArrowUp02Icon',
																phosphor: 'ArrowUpIcon',
																remixicon: 'RiArrowUpLine'
															});
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
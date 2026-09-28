import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-2"><h4 class="leading-none font-medium">Your connection is not secure.</h4> <p class="text-sm text-muted-foreground">You should not enter any sensitive information on this site.</p></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input_group_with_tooltip($$anchor) {
	let country = $.state("+1");

	Example($$anchor, {
		title: 'With Tooltip, Dropdown, Popover',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'input-tooltip-20',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Tooltip');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
										InputGroup_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
													InputGroup_Input($$anchor, { id: 'input-tooltip-20' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
													InputGroup_Addon($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = $.comment();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																Tooltip_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root();
																		var node_7 = $.first_child(fragment_6);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_7 = $.comment();
																				var node_8 = $.first_child(fragment_7);

																				$.component(node_8, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																					InputGroup_Button($$anchor, $.spread_props(props, {
																						class: 'rounded-full',
																						size: 'icon-xs',
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
																				});

																				$.append($$anchor, fragment_7);
																			};

																			$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																				Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_9 = $.sibling(node_7, 2);

																		$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																			Tooltip_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('This is content in a tooltip.');

																					$.append($$anchor, text_1);
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

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_3, 2);

									$.component(node_10, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('This is a description of the input group.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_1, 2);

						$.component(node_11, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_12 = $.first_child(fragment_9);

									$.component(node_12, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'input-dropdown-21',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Dropdown');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
										InputGroup_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_14 = $.first_child(fragment_10);

												$.component(node_14, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
													InputGroup_Input_1($$anchor, { id: 'input-dropdown-21' });
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
													InputGroup_Addon_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_16 = $.first_child(fragment_11);

															$.component(node_16, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
																DropdownMenu_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = root();
																		var node_17 = $.first_child(fragment_12);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_13 = $.comment();
																				var node_18 = $.first_child(fragment_13);

																				$.component(node_18, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																					InputGroup_Button_1($$anchor, $.spread_props(props, {
																						class: 'text-muted-foreground tabular-nums',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var fragment_14 = root_2();
																							var text_4 = $.first_child(fragment_14);
																							var node_19 = $.sibling(text_4);

																							IconPlaceholder(node_19, {
																								lucide: 'ChevronDownIcon',
																								tabler: 'IconChevronDown',
																								hugeicons: 'ArrowDownIcon',
																								phosphor: 'CaretDownIcon',
																								remixicon: 'RiArrowDownSLine'
																							});

																							$.template_effect(() => $.set_text(text_4, `${$.get(country) ?? ''} `));
																							$.append($$anchor, fragment_14);
																						},
																						$$slots: { default: true }
																					}));
																				});

																				$.append($$anchor, fragment_13);
																			};

																			$.component(node_17, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																				DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_20 = $.sibling(node_17, 2);

																		$.component(node_20, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																			DropdownMenu_Content($$anchor, {
																				align: 'start',
																				class: 'min-w-16',
																				sideOffset: 10,
																				alignOffset: -8,
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = root_1();
																					var node_21 = $.first_child(fragment_15);

																					$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																						DropdownMenu_Item($$anchor, {
																							onclick: () => $.set(country, "+1"),
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('+1');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_22 = $.sibling(node_21, 2);

																					$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																						DropdownMenu_Item_1($$anchor, {
																							onclick: () => $.set(country, "+44"),
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text('+44');

																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_23 = $.sibling(node_22, 2);

																					$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																						DropdownMenu_Item_2($$anchor, {
																							onclick: () => $.set(country, "+46"),
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_7 = $.text('+46');

																								$.append($$anchor, text_7);
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

									var node_24 = $.sibling(node_13, 2);

									$.component(node_24, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('This is a description of the input group.');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_25 = $.sibling(node_11, 2);

						$.component(node_25, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_1();
									var node_26 = $.first_child(fragment_16);

									$.component(node_26, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'input-secure-19',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Popover');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_27 = $.sibling(node_26, 2);

									$.component(node_27, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
										InputGroup_Root_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = root_4();
												var node_28 = $.first_child(fragment_17);

												$.component(node_28, () => Popover.Root, ($$anchor, Popover_Root) => {
													Popover_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_18 = root();
															var node_29 = $.first_child(fragment_18);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;
																	var fragment_19 = $.comment();
																	var node_30 = $.first_child(fragment_19);

																	$.component(node_30, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																		InputGroup_Addon_2($$anchor, $.spread_props(props, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_20 = $.comment();
																				var node_31 = $.first_child(fragment_20);

																				$.component(node_31, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																					InputGroup_Button_2($$anchor, {
																						variant: 'secondary',
																						size: 'icon-xs',
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
																					});
																				});

																				$.append($$anchor, fragment_20);
																			},
																			$$slots: { default: true }
																		}));
																	});

																	$.append($$anchor, fragment_19);
																};

																$.component(node_29, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																	Popover_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_32 = $.sibling(node_29, 2);

															$.component(node_32, () => Popover.Content, ($$anchor, Popover_Content) => {
																Popover_Content($$anchor, {
																	align: 'start',
																	children: ($$anchor, $$slotProps) => {
																		var div = root_3();

																		$.append($$anchor, div);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_18);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_28, 2);

												$.component(node_33, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
													InputGroup_Addon_3($$anchor, {
														class: 'pl-1 text-muted-foreground',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('https://');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_34 = $.sibling(node_33, 2);

												$.component(node_34, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
													InputGroup_Input_2($$anchor, { id: 'input-secure-19' });
												});

												var node_35 = $.sibling(node_34, 2);

												$.component(node_35, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
													InputGroup_Addon_4($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = $.comment();
															var node_36 = $.first_child(fragment_22);

															$.component(node_36, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																InputGroup_Button_3($$anchor, {
																	size: 'icon-xs',
																	onclick: () => {},
																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'StarIcon',
																			tabler: 'IconStar',
																			hugeicons: 'StarIcon',
																			phosphor: 'StarIcon',
																			remixicon: 'RiStarLine'
																		});
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_17);
											},
											$$slots: { default: true }
										});
									});

									var node_37 = $.sibling(node_27, 2);

									$.component(node_37, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('This is a description of the input group.');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});
						});

						var node_38 = $.sibling(node_25, 2);

						$.component(node_38, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_1();
									var node_39 = $.first_child(fragment_24);

									$.component(node_39, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'url',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('Button Group');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									var node_40 = $.sibling(node_39, 2);

									$.component(node_40, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
										ButtonGroup_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_25 = root_1();
												var node_41 = $.first_child(fragment_25);

												$.component(node_41, () => ButtonGroup.Text, ($$anchor, ButtonGroup_Text) => {
													ButtonGroup_Text($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('https://');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_42 = $.sibling(node_41, 2);

												$.component(node_42, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
													InputGroup_Root_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_26 = root();
															var node_43 = $.first_child(fragment_26);

															$.component(node_43, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
																InputGroup_Input_3($$anchor, { id: 'url' });
															});

															var node_44 = $.sibling(node_43, 2);

															$.component(node_44, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
																InputGroup_Addon_5($$anchor, {
																	align: 'inline-end',
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
																});
															});

															$.append($$anchor, fragment_26);
														},
														$$slots: { default: true }
													});
												});

												var node_45 = $.sibling(node_42, 2);

												$.component(node_45, () => ButtonGroup.Text, ($$anchor, ButtonGroup_Text_1) => {
													ButtonGroup_Text_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('.com');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_25);
											},
											$$slots: { default: true }
										});
									});

									var node_46 = $.sibling(node_40, 2);

									$.component(node_46, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('This is a description of the input group.');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_24);
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
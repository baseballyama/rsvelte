import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span class="sr-only">Send</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex flex-col gap-6"><!> <!> <!> <!> <!></div>`);

export default function Input_group_examples($$anchor) {
	let isFavorite = $.state(false);
	let voiceEnabled = $.state(false);

	Example($$anchor, {
		title: 'Input Group',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var node = $.child(div);

			$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
				InputGroup_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, { placeholder: 'Search...' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
							InputGroup_Addon($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
							InputGroup_Addon_1($$anchor, {
								align: 'inline-end',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('12 results');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
				InputGroup_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
							InputGroup_Input_1($$anchor, { placeholder: 'example.com', class: 'pl-1!' });
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
							InputGroup_Addon_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
										InputGroup_Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('https://');

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

						var node_8 = $.sibling(node_6, 2);

						$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
							InputGroup_Addon_3($$anchor, {
								align: 'inline-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
										Tooltip_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_10 = $.first_child(fragment_6);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var fragment_7 = $.comment();
														var node_11 = $.first_child(fragment_7);

														$.component(node_11, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
															InputGroup_Button($$anchor, $.spread_props({ class: 'rounded-full', size: 'icon-xs', 'aria-label': 'Info' }, props, {
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

													$.component(node_10, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
														Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_12 = $.sibling(node_10, 2);

												$.component(node_12, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
													Tooltip_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('This is content in a tooltip.');

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

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_13 = $.sibling(node_4, 2);

			$.component(node_13, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root_1();
						var node_14 = $.first_child(fragment_9);

						Label(node_14, {
							for: 'input-secure-19',
							class: 'sr-only',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Input Secure');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
							InputGroup_Root_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_3();
									var node_16 = $.first_child(fragment_10);

									$.component(node_16, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
										InputGroup_Input_2($$anchor, { id: 'input-secure-19', class: 'pl-0.5!' });
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
										InputGroup_Addon_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_18 = $.first_child(fragment_11);

												$.component(node_18, () => Popover.Root, ($$anchor, Popover_Root) => {
													Popover_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_1();
															var node_19 = $.first_child(fragment_12);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;
																	var fragment_13 = $.comment();
																	var node_20 = $.first_child(fragment_13);

																	$.component(node_20, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																		InputGroup_Button_1($$anchor, $.spread_props({ variant: 'secondary', size: 'icon-xs', 'aria-label': 'Info' }, props, {
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

																	$.append($$anchor, fragment_13);
																};

																$.component(node_19, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																	Popover_Trigger($$anchor, { child, $$slots: { child: true } });
																});
															}

															var node_21 = $.sibling(node_19, 2);

															$.component(node_21, () => Popover.Content, ($$anchor, Popover_Content) => {
																Popover_Content($$anchor, {
																	align: 'start',
																	alignOffset: 10,
																	class: 'flex flex-col gap-1 rounded-xl text-sm',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_15 = root_2();

																		$.next(2);
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

									var node_22 = $.sibling(node_17, 2);

									$.component(node_22, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
										InputGroup_Addon_5($$anchor, {
											class: 'pl-1! text-muted-foreground',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('https://');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_6) => {
										InputGroup_Addon_6($$anchor, {
											align: 'inline-end',
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = $.comment();
												var node_24 = $.first_child(fragment_16);

												$.component(node_24, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
													InputGroup_Button_2($$anchor, {
														onclick: () => $.set(isFavorite, !$.get(isFavorite)),
														size: 'icon-xs',
														'aria-label': 'Favorite',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'StarIcon',
																tabler: 'IconStar',
																hugeicons: 'StarIcon',
																phosphor: 'StarIcon',
																remixicon: 'RiStarLine',
																get 'data-favorite'() {
																	return $.get(isFavorite);
																},
																class: 'data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary'
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			var node_25 = $.sibling(node_13, 2);

			$.component(node_25, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
				ButtonGroup_Root($$anchor, {
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_18 = root_1();
						var node_26 = $.first_child(fragment_18);

						$.component(node_26, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
							ButtonGroup_Root_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										size: 'icon',
										'aria-label': 'Add',
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
									});
								},
								$$slots: { default: true }
							});
						});

						var node_27 = $.sibling(node_26, 2);

						$.component(node_27, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
							ButtonGroup_Root_2($$anchor, {
								class: 'flex-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_21 = $.comment();
									var node_28 = $.first_child(fragment_21);

									$.component(node_28, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
										InputGroup_Root_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = root_1();
												var node_29 = $.first_child(fragment_22);

												{
													let $0 = $.derived(() => $.get(voiceEnabled) ? "Record and send audio..." : "Send a message...");

													$.component(node_29, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
														InputGroup_Input_3($$anchor, {
															get placeholder() {
																return $.get($0);
															},

															get disabled() {
																return $.get(voiceEnabled);
															}
														});
													});
												}

												var node_30 = $.sibling(node_29, 2);

												$.component(node_30, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_7) => {
													InputGroup_Addon_7($$anchor, {
														align: 'inline-end',
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = $.comment();
															var node_31 = $.first_child(fragment_23);

															$.component(node_31, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																Tooltip_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = root_1();
																		var node_32 = $.first_child(fragment_24);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_25 = $.comment();
																				var node_33 = $.first_child(fragment_25);

																				$.component(node_33, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																					InputGroup_Button_3($$anchor, $.spread_props(
																						{
																							onclick: () => $.set(voiceEnabled, !$.get(voiceEnabled)),
																							get 'data-active'() {
																								return $.get(voiceEnabled);
																							},
																							class: 'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
																							get 'aria-pressed'() {
																								return $.get(voiceEnabled);
																							},
																							size: 'icon-xs',
																							'aria-label': 'Voice Mode'
																						},
																						props,
																						{
																							children: ($$anchor, $$slotProps) => {
																								IconPlaceholder($$anchor, {
																									lucide: 'AudioLinesIcon',
																									tabler: 'IconWaveSine',
																									hugeicons: 'AudioWave01Icon',
																									phosphor: 'MicrophoneIcon',
																									remixicon: 'RiMicLine'
																								});
																							},
																							$$slots: { default: true }
																						}
																					));
																				});

																				$.append($$anchor, fragment_25);
																			};

																			$.component(node_32, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																				Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
																			});
																		}

																		var node_34 = $.sibling(node_32, 2);

																		$.component(node_34, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																			Tooltip_Content_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Voice Mode');

																					$.append($$anchor, text_5);
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

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_21);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_18);
					},
					$$slots: { default: true }
				});
			});

			var node_35 = $.sibling(node_25, 2);

			$.component(node_35, () => InputGroup.Root, ($$anchor, InputGroup_Root_4) => {
				InputGroup_Root_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_27 = root_1();
						var node_36 = $.first_child(fragment_27);

						$.component(node_36, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
							InputGroup_Textarea($$anchor, { placeholder: 'Ask, Search or Chat...' });
						});

						var node_37 = $.sibling(node_36, 2);

						$.component(node_37, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_8) => {
							InputGroup_Addon_8($$anchor, {
								align: 'block-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_28 = root_5();
									var node_38 = $.first_child(fragment_28);

									$.component(node_38, () => InputGroup.Button, ($$anchor, InputGroup_Button_4) => {
										InputGroup_Button_4($$anchor, {
											variant: 'outline',
											class: 'rounded-full style-lyra:rounded-none',
											size: 'icon-xs',
											'aria-label': 'Add',
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
										});
									});

									var node_39 = $.sibling(node_38, 2);

									$.component(node_39, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
										DropdownMenu_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_30 = root_1();
												var node_40 = $.first_child(fragment_30);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var fragment_31 = $.comment();
														var node_41 = $.first_child(fragment_31);

														$.component(node_41, () => InputGroup.Button, ($$anchor, InputGroup_Button_5) => {
															InputGroup_Button_5($$anchor, $.spread_props({ variant: 'ghost' }, props, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_6 = $.text('Auto');

																	$.append($$anchor, text_6);
																},
																$$slots: { default: true }
															}));
														});

														$.append($$anchor, fragment_31);
													};

													$.component(node_40, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
														DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_42 = $.sibling(node_40, 2);

												$.component(node_42, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
													DropdownMenu_Content($$anchor, {
														side: 'top',
														align: 'start',
														class: '[--radius:0.95rem]',
														children: ($$anchor, $$slotProps) => {
															var fragment_32 = $.comment();
															var node_43 = $.first_child(fragment_32);

															$.component(node_43, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																DropdownMenu_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_33 = root();
																		var node_44 = $.first_child(fragment_33);

																		$.component(node_44, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																			DropdownMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Auto');

																					$.append($$anchor, text_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_45 = $.sibling(node_44, 2);

																		$.component(node_45, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																			DropdownMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_8 = $.text('Agent');

																					$.append($$anchor, text_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_46 = $.sibling(node_45, 2);

																		$.component(node_46, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('Manual');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		});

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

												$.append($$anchor, fragment_30);
											},
											$$slots: { default: true }
										});
									});

									var node_47 = $.sibling(node_39, 2);

									$.component(node_47, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
										InputGroup_Text_1($$anchor, {
											class: 'ml-auto',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('52% used');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									var node_48 = $.sibling(node_47, 2);

									Separator(node_48, { orientation: 'vertical', class: 'h-4!' });

									var node_49 = $.sibling(node_48, 2);

									$.component(node_49, () => InputGroup.Button, ($$anchor, InputGroup_Button_6) => {
										InputGroup_Button_6($$anchor, {
											variant: 'default',
											class: 'rounded-full style-lyra:rounded-none',
											size: 'icon-xs',
											children: ($$anchor, $$slotProps) => {
												var fragment_34 = root_4();
												var node_50 = $.first_child(fragment_34);

												IconPlaceholder(node_50, {
													lucide: 'ArrowUpIcon',
													tabler: 'IconArrowUp',
													hugeicons: 'ArrowUp01Icon',
													phosphor: 'ArrowUpIcon',
													remixicon: 'RiArrowUpLine'
												});

												$.next(2);
												$.append($$anchor, fragment_34);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_28);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_27);
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
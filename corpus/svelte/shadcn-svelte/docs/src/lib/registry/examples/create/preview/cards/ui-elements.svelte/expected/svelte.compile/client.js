import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="hidden md:block">Alert Dialog</span> <span class="block md:hidden">Dialog</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex flex-wrap gap-2"><!> <!> <!> <!></div> <!></div> <!> <!> <div class="flex items-center gap-2"><div class="flex gap-2"><!> <!> <!></div> <!> <div class="flex gap-3"><!> <!></div></div> <div class="flex items-center gap-4"><!> <!> <!></div>`, 1);

export default function Ui_elements($$anchor) {
	let sliderValue = $.state(500);
	let radioValue = $.state("apple");
	let switchChecked = $.state(true);
	let checkbox1Checked = $.state(true);
	let checkbox2Checked = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var div = $.first_child(fragment_2);
							var div_1 = $.child(div);
							var node_2 = $.child(div_1);

							Button(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Button');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Button(node_3, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Secondary');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Button(node_4, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Outline');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Button(node_5, {
								variant: 'destructive',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Delete');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);

							var node_6 = $.sibling(div_1, 2);

							$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_7 = $.first_child(fragment_3);

										$.component(node_7, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => Item.Title, ($$anchor, Item_Title) => {
														Item_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Two-factor authentication');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Item.Description, ($$anchor, Item_Description) => {
														Item_Description($$anchor, {
															class: 'text-pretty xl:hidden 2xl:block',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Verify via email or phone number.');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Item.Actions, ($$anchor, Item_Actions) => {
											Item_Actions($$anchor, {
												class: 'hidden md:flex',
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														size: 'sm',
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Enable');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_11 = $.sibling(div, 2);

							Slider(node_11, {
								type: 'single',
								max: 1000,
								min: 0,
								step: 10,
								class: 'flex-1',
								'aria-label': 'Slider',
								get value() {
									return $.get(sliderValue);
								},

								set value($$value) {
									$.set(sliderValue, $$value, true);
								}
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_13 = $.first_child(fragment_6);

										$.component(node_13, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_14 = $.first_child(fragment_7);

													$.component(node_14, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root();
																var node_15 = $.first_child(fragment_8);

																$.component(node_15, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { placeholder: 'Name' });
																});

																var node_16 = $.sibling(node_15, 2);

																$.component(node_16, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		align: 'inline-end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_17 = $.first_child(fragment_9);

																			$.component(node_17, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																				InputGroup_Text($$anchor, {
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

										var node_18 = $.sibling(node_13, 2);

										$.component(node_18, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												class: 'flex-1',
												children: ($$anchor, $$slotProps) => {
													Textarea($$anchor, { placeholder: 'Message', class: 'resize-none' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var div_2 = $.sibling(node_12, 2);
							var div_3 = $.child(div_2);
							var node_19 = $.child(div_3);

							Badge(node_19, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Badge');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							Badge(node_20, {
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Secondary');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							Badge(node_21, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Outline');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.reset(div_3);

							var node_22 = $.sibling(div_3, 2);

							$.component(node_22, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, {
									class: 'ml-auto flex w-fit gap-3',
									get value() {
										return $.get(radioValue);
									},

									set value($$value) {
										$.set(radioValue, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root();
										var node_23 = $.first_child(fragment_12);

										$.component(node_23, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
											RadioGroup_Item($$anchor, { value: 'apple' });
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
											RadioGroup_Item_1($$anchor, { value: 'banana' });
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							var div_4 = $.sibling(node_22, 2);
							var node_25 = $.child(div_4);

							Checkbox(node_25, {
								get checked() {
									return $.get(checkbox1Checked);
								},

								set checked($$value) {
									$.set(checkbox1Checked, $$value, true);
								}
							});

							var node_26 = $.sibling(node_25, 2);

							Checkbox(node_26, {
								get checked() {
									return $.get(checkbox2Checked);
								},

								set checked($$value) {
									$.set(checkbox2Checked, $$value, true);
								}
							});

							$.reset(div_4);
							$.reset(div_2);

							var div_5 = $.sibling(div_2, 2);
							var node_27 = $.child(div_5);

							$.component(node_27, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
								AlertDialog_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root();
										var node_28 = $.first_child(fragment_13);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = root_1();

														$.next(2);
														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_28, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
												AlertDialog_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_29 = $.sibling(node_28, 2);

										$.component(node_29, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
											AlertDialog_Content($$anchor, {
												size: 'sm',
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root();
													var node_30 = $.first_child(fragment_16);

													$.component(node_30, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
														AlertDialog_Header($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root();
																var node_31 = $.first_child(fragment_17);

																$.component(node_31, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
																	AlertDialog_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('Allow accessory to connect?');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_32 = $.sibling(node_31, 2);

																$.component(node_32, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
																	AlertDialog_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Do you want to allow the USB accessory to connect to this device and your data?');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													var node_33 = $.sibling(node_30, 2);

													$.component(node_33, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
														AlertDialog_Footer($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = root();
																var node_34 = $.first_child(fragment_18);

																$.component(node_34, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
																	AlertDialog_Cancel($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text('Don\'t allow');

																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_35 = $.sibling(node_34, 2);

																$.component(node_35, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
																	AlertDialog_Action($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Allow');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							var node_36 = $.sibling(node_27, 2);

							$.component(node_36, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
								ButtonGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = root();
										var node_37 = $.first_child(fragment_19);

										Button(node_37, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Button Group');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});

										var node_38 = $.sibling(node_37, 2);

										$.component(node_38, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
											DropdownMenu_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_20 = root();
													var node_39 = $.first_child(fragment_20);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'ChevronUpIcon',
																		tabler: 'IconChevronUp',
																		hugeicons: 'ArrowUp01Icon',
																		phosphor: 'CaretUpIcon',
																		remixicon: 'RiArrowUpSLine'
																	});
																},
																$$slots: { default: true }
															}));
														};

														$.component(node_39, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
															DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_40 = $.sibling(node_39, 2);

													$.component(node_40, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
														DropdownMenu_Content($$anchor, {
															align: 'end',
															side: 'top',
															class: 'w-40',
															children: ($$anchor, $$slotProps) => {
																var fragment_23 = root_3();
																var node_41 = $.first_child(fragment_23);

																$.component(node_41, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																	DropdownMenu_Group($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_24 = root_2();
																			var node_42 = $.first_child(fragment_24);

																			$.component(node_42, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																				DropdownMenu_Label($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_15 = $.text('Quick Actions');

																						$.append($$anchor, text_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_43 = $.sibling(node_42, 2);

																			$.component(node_43, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																				DropdownMenu_Item($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text('Mute Conversation');

																						$.append($$anchor, text_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_44 = $.sibling(node_43, 2);

																			$.component(node_44, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																				DropdownMenu_Item_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_17 = $.text('Mark as Read');

																						$.append($$anchor, text_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_45 = $.sibling(node_44, 2);

																			$.component(node_45, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																				DropdownMenu_Item_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_18 = $.text('Block User');

																						$.append($$anchor, text_18);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_24);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_46 = $.sibling(node_41, 2);

																$.component(node_46, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																	DropdownMenu_Separator($$anchor, {});
																});

																var node_47 = $.sibling(node_46, 2);

																$.component(node_47, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																	DropdownMenu_Group_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = root_2();
																			var node_48 = $.first_child(fragment_25);

																			$.component(node_48, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																				DropdownMenu_Label_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_19 = $.text('Conversation');

																						$.append($$anchor, text_19);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_49 = $.sibling(node_48, 2);

																			$.component(node_49, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																				DropdownMenu_Item_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_20 = $.text('Share Conversation');

																						$.append($$anchor, text_20);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_50 = $.sibling(node_49, 2);

																			$.component(node_50, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																				DropdownMenu_Item_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_21 = $.text('Copy Conversation');

																						$.append($$anchor, text_21);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_51 = $.sibling(node_50, 2);

																			$.component(node_51, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																				DropdownMenu_Item_5($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_22 = $.text('Report Conversation');

																						$.append($$anchor, text_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_52 = $.sibling(node_47, 2);

																$.component(node_52, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																	DropdownMenu_Separator_1($$anchor, {});
																});

																var node_53 = $.sibling(node_52, 2);

																$.component(node_53, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																	DropdownMenu_Group_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_26 = $.comment();
																			var node_54 = $.first_child(fragment_26);

																			$.component(node_54, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																				DropdownMenu_Item_6($$anchor, {
																					variant: 'destructive',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_23 = $.text('Delete Conversation');

																						$.append($$anchor, text_23);
																					},
																					$$slots: { default: true }
																				});
																			});

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

							var node_55 = $.sibling(node_36, 2);

							Switch(node_55, {
								class: 'ml-auto',
								get checked() {
									return $.get(switchChecked);
								},

								set checked($$value) {
									$.set(switchChecked, $$value, true);
								}
							});

							$.reset(div_5);
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
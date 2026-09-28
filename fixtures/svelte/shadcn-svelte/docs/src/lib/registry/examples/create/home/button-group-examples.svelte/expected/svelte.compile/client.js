import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Mark as Read`, 1);
var root_2 = $.from_html(`<!> Archive`, 1);
var root_3 = $.from_html(`<!> Snooze`, 1);
var root_4 = $.from_html(`<!> Add to Calendar`, 1);
var root_5 = $.from_html(`<!> Add to List`, 1);
var root_6 = $.from_html(`<!> Label As...`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> Trash`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<!> Mute Conversation`, 1);
var root_12 = $.from_html(`<!> Block User`, 1);
var root_13 = $.from_html(`<!> Share Conversation`, 1);
var root_14 = $.from_html(`<!> Copy Conversation`, 1);
var root_15 = $.from_html(`<!> Report Conversation`, 1);
var root_16 = $.from_html(`<!> Delete Conversation`, 1);
var root_17 = $.from_html(`<!> Copilot`, 1);
var root_18 = $.from_html(`<!> <div class="text-sm *:[p:not(:last-child)]:mb-2"><!></div>`, 1);
var root_19 = $.from_html(`<div class="flex flex-col gap-6"><!> <div class="flex gap-4"><!> <!></div></div>`);

export default function Button_group_examples($$anchor) {
	let label = $.state("personal");

	Example($$anchor, {
		title: 'Button Group',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var div = root_19();
			var node = $.child(div);

			$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
				ButtonGroup_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_8();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
							ButtonGroup_Root_1($$anchor, {
								class: 'hidden sm:flex',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										size: 'icon-sm',
										'aria-label': 'Go Back',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'ArrowLeftIcon',
												tabler: 'IconArrowLeft',
												hugeicons: 'ArrowLeft01Icon',
												phosphor: 'ArrowLeftIcon',
												remixicon: 'RiArrowLeftLine'
											});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
							ButtonGroup_Root_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									Button(node_3, {
										variant: 'outline',
										size: 'sm',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Archive');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_4 = $.sibling(node_3, 2);

									Button(node_4, {
										variant: 'outline',
										size: 'sm',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Report');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_3) => {
							ButtonGroup_Root_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_6 = $.first_child(fragment_5);

									Button(node_6, {
										variant: 'outline',
										size: 'sm',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Snooze');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
										DropdownMenu_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_8 = $.first_child(fragment_6);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props(
															{
																variant: 'outline',
																size: 'icon-sm',
																'aria-label': 'More Options'
															},
															props,
															{
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'ChevronDownIcon',
																		tabler: 'IconChevronDown',
																		hugeicons: 'ArrowDown01Icon',
																		phosphor: 'CaretDownIcon',
																		remixicon: 'RiArrowDownSLine'
																	});
																},
																$$slots: { default: true }
															}
														));
													};

													$.component(node_8, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
														DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
													DropdownMenu_Content($$anchor, {
														align: 'end',
														class: 'w-48',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_10();
															var node_10 = $.first_child(fragment_9);

															$.component(node_10, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																DropdownMenu_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root();
																		var node_11 = $.first_child(fragment_10);

																		$.component(node_11, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																			DropdownMenu_Item($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_1();
																					var node_12 = $.first_child(fragment_11);

																					IconPlaceholder(node_12, {
																						lucide: 'MailCheckIcon',
																						tabler: 'IconMailCheck',
																						hugeicons: 'MailValidation01Icon',
																						phosphor: 'EnvelopeIcon',
																						remixicon: 'RiMailCheckLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_13 = $.sibling(node_11, 2);

																		$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																			DropdownMenu_Item_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_2();
																					var node_14 = $.first_child(fragment_12);

																					IconPlaceholder(node_14, {
																						lucide: 'ArchiveIcon',
																						tabler: 'IconArchive',
																						hugeicons: 'ArchiveIcon',
																						phosphor: 'ArchiveIcon',
																						remixicon: 'RiArchiveLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															var node_15 = $.sibling(node_10, 2);

															$.component(node_15, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																DropdownMenu_Separator($$anchor, {});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																DropdownMenu_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = root_8();
																		var node_17 = $.first_child(fragment_13);

																		$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																			DropdownMenu_Item_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_3();
																					var node_18 = $.first_child(fragment_14);

																					IconPlaceholder(node_18, {
																						lucide: 'ClockIcon',
																						tabler: 'IconClock',
																						hugeicons: 'ClockIcon',
																						phosphor: 'ClockIcon',
																						remixicon: 'RiTimeLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_19 = $.sibling(node_17, 2);

																		$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																			DropdownMenu_Item_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = root_4();
																					var node_20 = $.first_child(fragment_15);

																					IconPlaceholder(node_20, {
																						lucide: 'CalendarPlusIcon',
																						tabler: 'IconCalendarPlus',
																						hugeicons: 'CalendarAdd01Icon',
																						phosphor: 'CalendarPlusIcon',
																						remixicon: 'RiCalendarCheckLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_21 = $.sibling(node_19, 2);

																		$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																			DropdownMenu_Item_4($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_16 = root_5();
																					var node_22 = $.first_child(fragment_16);

																					IconPlaceholder(node_22, {
																						lucide: 'ListFilterIcon',
																						tabler: 'IconFilterPlus',
																						hugeicons: 'AddToListIcon',
																						phosphor: 'ListPlusIcon',
																						remixicon: 'RiAddBoxLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_16);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_23 = $.sibling(node_21, 2);

																		$.component(node_23, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
																			DropdownMenu_Sub($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_17 = root();
																					var node_24 = $.first_child(fragment_17);

																					$.component(node_24, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																						DropdownMenu_SubTrigger($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_18 = root_6();
																								var node_25 = $.first_child(fragment_18);

																								IconPlaceholder(node_25, {
																									lucide: 'TagIcon',
																									tabler: 'IconTag',
																									hugeicons: 'TagIcon',
																									phosphor: 'TagIcon',
																									remixicon: 'RiPriceTagLine'
																								});

																								$.next();
																								$.append($$anchor, fragment_18);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_26 = $.sibling(node_24, 2);

																					$.component(node_26, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
																						DropdownMenu_Portal($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_19 = $.comment();
																								var node_27 = $.first_child(fragment_19);

																								$.component(node_27, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																									DropdownMenu_SubContent($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_20 = $.comment();
																											var node_28 = $.first_child(fragment_20);

																											$.component(node_28, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																												DropdownMenu_Group_2($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_21 = $.comment();
																														var node_29 = $.first_child(fragment_21);

																														$.component(node_29, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																															DropdownMenu_RadioGroup($$anchor, {
																																get value() {
																																	return $.get(label);
																																},

																																set value($$value) {
																																	$.set(label, $$value, true);
																																},

																																children: ($$anchor, $$slotProps) => {
																																	var fragment_22 = root_7();
																																	var node_30 = $.first_child(fragment_22);

																																	$.component(node_30, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																																		DropdownMenu_RadioItem($$anchor, {
																																			value: 'personal',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_3 = $.text('Personal');

																																				$.append($$anchor, text_3);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_31 = $.sibling(node_30, 2);

																																	$.component(node_31, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																																		DropdownMenu_RadioItem_1($$anchor, {
																																			value: 'work',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_4 = $.text('Work');

																																				$.append($$anchor, text_4);
																																			},
																																			$$slots: { default: true }
																																		});
																																	});

																																	var node_32 = $.sibling(node_31, 2);

																																	$.component(node_32, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																																		DropdownMenu_RadioItem_2($$anchor, {
																																			value: 'other',
																																			children: ($$anchor, $$slotProps) => {
																																				$.next();

																																				var text_5 = $.text('Other');

																																				$.append($$anchor, text_5);
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

																					$.append($$anchor, fragment_17);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	},
																	$$slots: { default: true }
																});
															});

															var node_33 = $.sibling(node_16, 2);

															$.component(node_33, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																DropdownMenu_Separator_1($$anchor, {});
															});

															var node_34 = $.sibling(node_33, 2);

															$.component(node_34, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
																DropdownMenu_Group_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_23 = $.comment();
																		var node_35 = $.first_child(fragment_23);

																		$.component(node_35, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																			DropdownMenu_Item_5($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_24 = root_9();
																					var node_36 = $.first_child(fragment_24);

																					IconPlaceholder(node_36, {
																						lucide: 'Trash2Icon',
																						tabler: 'IconTrash',
																						hugeicons: 'Delete02Icon',
																						phosphor: 'TrashIcon',
																						remixicon: 'RiDeleteBinLine'
																					});

																					$.next();
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

															$.append($$anchor, fragment_9);
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

						var node_37 = $.sibling(node_5, 2);

						$.component(node_37, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_4) => {
							ButtonGroup_Root_4($$anchor, {
								class: 'hidden sm:flex',
								children: ($$anchor, $$slotProps) => {
									var fragment_25 = root();
									var node_38 = $.first_child(fragment_25);

									Button(node_38, {
										variant: 'outline',
										size: 'icon-sm',
										'aria-label': 'Previous',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'ArrowLeftIcon',
												tabler: 'IconArrowLeft',
												hugeicons: 'ArrowLeft01Icon',
												phosphor: 'ArrowLeftIcon',
												remixicon: 'RiArrowLeftLine'
											});
										},
										$$slots: { default: true }
									});

									var node_39 = $.sibling(node_38, 2);

									Button(node_39, {
										variant: 'outline',
										size: 'icon-sm',
										'aria-label': 'Next',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'ArrowRightIcon',
												tabler: 'IconArrowRight',
												hugeicons: 'ArrowRight01Icon',
												phosphor: 'ArrowRightIcon',
												remixicon: 'RiArrowRightLine'
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_25);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var div_1 = $.sibling(node, 2);
			var node_40 = $.child(div_1);

			$.component(node_40, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_5) => {
				ButtonGroup_Root_5($$anchor, {
					class: 'hidden sm:flex',
					children: ($$anchor, $$slotProps) => {
						var fragment_28 = $.comment();
						var node_41 = $.first_child(fragment_28);

						$.component(node_41, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_6) => {
							ButtonGroup_Root_6($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_29 = root_7();
									var node_42 = $.first_child(fragment_29);

									Button(node_42, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('1');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_43 = $.sibling(node_42, 2);

									Button(node_43, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('2');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									var node_44 = $.sibling(node_43, 2);

									Button(node_44, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('3');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_29);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_28);
					},
					$$slots: { default: true }
				});
			});

			var node_45 = $.sibling(node_40, 2);

			$.component(node_45, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_7) => {
				ButtonGroup_Root_7($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_30 = root();
						var node_46 = $.first_child(fragment_30);

						$.component(node_46, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_8) => {
							ButtonGroup_Root_8($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_31 = root();
									var node_47 = $.first_child(fragment_31);

									Button(node_47, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Follow');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									var node_48 = $.sibling(node_47, 2);

									$.component(node_48, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
										DropdownMenu_Root_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root();
												var node_49 = $.first_child(fragment_32);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
															children: ($$anchor, $$slotProps) => {
																IconPlaceholder($$anchor, {
																	lucide: 'ChevronDownIcon',
																	tabler: 'IconChevronDown',
																	hugeicons: 'ArrowDown01Icon',
																	phosphor: 'CaretDownIcon',
																	remixicon: 'RiArrowDownSLine'
																});
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_49, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
														DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_50 = $.sibling(node_49, 2);

												$.component(node_50, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
													DropdownMenu_Content_1($$anchor, {
														align: 'end',
														class: 'w-52',
														children: ($$anchor, $$slotProps) => {
															var fragment_35 = root_10();
															var node_51 = $.first_child(fragment_35);

															$.component(node_51, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_4) => {
																DropdownMenu_Group_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_36 = root_8();
																		var node_52 = $.first_child(fragment_36);

																		$.component(node_52, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																			DropdownMenu_Label($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text('Quick Actions');

																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_53 = $.sibling(node_52, 2);

																		$.component(node_53, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																			DropdownMenu_Item_6($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_37 = root_11();
																					var node_54 = $.first_child(fragment_37);

																					IconPlaceholder(node_54, {
																						lucide: 'VolumeX',
																						tabler: 'IconVolume',
																						hugeicons: 'VolumeOffIcon',
																						phosphor: 'SpeakerSlashIcon',
																						remixicon: 'RiVolumeMuteLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_37);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_55 = $.sibling(node_53, 2);

																		$.component(node_55, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
																			DropdownMenu_Item_7($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_38 = root_1();
																					var node_56 = $.first_child(fragment_38);

																					IconPlaceholder(node_56, {
																						lucide: 'CheckIcon',
																						tabler: 'IconCheck',
																						hugeicons: 'Tick02Icon',
																						phosphor: 'CheckIcon',
																						remixicon: 'RiCheckLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_38);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_57 = $.sibling(node_55, 2);

																		$.component(node_57, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																			DropdownMenu_Item_8($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_39 = root_12();
																					var node_58 = $.first_child(fragment_39);

																					IconPlaceholder(node_58, {
																						lucide: 'UserRoundXIcon',
																						tabler: 'IconUserX',
																						hugeicons: 'UserRemove01Icon',
																						phosphor: 'UserMinusIcon',
																						remixicon: 'RiUserMinusLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_39);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_36);
																	},
																	$$slots: { default: true }
																});
															});

															var node_59 = $.sibling(node_51, 2);

															$.component(node_59, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
																DropdownMenu_Separator_2($$anchor, {});
															});

															var node_60 = $.sibling(node_59, 2);

															$.component(node_60, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_5) => {
																DropdownMenu_Group_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_40 = root_8();
																		var node_61 = $.first_child(fragment_40);

																		$.component(node_61, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																			DropdownMenu_Label_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('Conversation');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_62 = $.sibling(node_61, 2);

																		$.component(node_62, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
																			DropdownMenu_Item_9($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_41 = root_13();
																					var node_63 = $.first_child(fragment_41);

																					IconPlaceholder(node_63, {
																						lucide: 'ShareIcon',
																						tabler: 'IconShare',
																						hugeicons: 'Share03Icon',
																						phosphor: 'ShareIcon',
																						remixicon: 'RiShareLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_41);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_64 = $.sibling(node_62, 2);

																		$.component(node_64, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
																			DropdownMenu_Item_10($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_42 = root_14();
																					var node_65 = $.first_child(fragment_42);

																					IconPlaceholder(node_65, {
																						lucide: 'CopyIcon',
																						tabler: 'IconCopy',
																						hugeicons: 'Copy01Icon',
																						phosphor: 'CopyIcon',
																						remixicon: 'RiFileCopyLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_42);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_66 = $.sibling(node_64, 2);

																		$.component(node_66, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
																			DropdownMenu_Item_11($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_43 = root_15();
																					var node_67 = $.first_child(fragment_43);

																					IconPlaceholder(node_67, {
																						lucide: 'AlertTriangleIcon',
																						tabler: 'IconAlertTriangle',
																						hugeicons: 'AlertCircleIcon',
																						phosphor: 'WarningIcon',
																						remixicon: 'RiAlertLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_43);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_40);
																	},
																	$$slots: { default: true }
																});
															});

															var node_68 = $.sibling(node_60, 2);

															$.component(node_68, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
																DropdownMenu_Separator_3($$anchor, {});
															});

															var node_69 = $.sibling(node_68, 2);

															$.component(node_69, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_6) => {
																DropdownMenu_Group_6($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_44 = $.comment();
																		var node_70 = $.first_child(fragment_44);

																		$.component(node_70, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_12) => {
																			DropdownMenu_Item_12($$anchor, {
																				variant: 'destructive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_45 = root_16();
																					var node_71 = $.first_child(fragment_45);

																					IconPlaceholder(node_71, {
																						lucide: 'TrashIcon',
																						tabler: 'IconTrash',
																						hugeicons: 'Delete02Icon',
																						phosphor: 'TrashIcon',
																						remixicon: 'RiDeleteBinLine'
																					});

																					$.next();
																					$.append($$anchor, fragment_45);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_44);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_35);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_31);
								},
								$$slots: { default: true }
							});
						});

						var node_72 = $.sibling(node_46, 2);

						$.component(node_72, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_9) => {
							ButtonGroup_Root_9($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_46 = root();
									var node_73 = $.first_child(fragment_46);

									Button(node_73, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											var fragment_47 = root_17();
											var node_74 = $.first_child(fragment_47);

											IconPlaceholder(node_74, {
												lucide: 'BotIcon',
												tabler: 'IconRobot',
												hugeicons: 'BotIcon',
												phosphor: 'RobotIcon',
												remixicon: 'RiRobotLine'
											});

											$.next();
											$.append($$anchor, fragment_47);
										},
										$$slots: { default: true }
									});

									var node_75 = $.sibling(node_73, 2);

									$.component(node_75, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_48 = root();
												var node_76 = $.first_child(fragment_48);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props(
															{
																variant: 'outline',
																size: 'icon',
																'aria-label': 'Open Popover'
															},
															props,
															{
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'ChevronDownIcon',
																		tabler: 'IconChevronDown',
																		hugeicons: 'ArrowDown01Icon',
																		phosphor: 'CaretDownIcon',
																		remixicon: 'RiArrowDownSLine'
																	});
																},
																$$slots: { default: true }
															}
														));
													};

													$.component(node_76, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_77 = $.sibling(node_76, 2);

												$.component(node_77, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														align: 'end',
														class: 'w-96',
														children: ($$anchor, $$slotProps) => {
															var fragment_51 = root_18();
															var node_78 = $.first_child(fragment_51);

															$.component(node_78, () => Popover.Header, ($$anchor, Popover_Header) => {
																Popover_Header($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_52 = root();
																		var node_79 = $.first_child(fragment_52);

																		$.component(node_79, () => Popover.Title, ($$anchor, Popover_Title) => {
																			Popover_Title($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_12 = $.text('Agent Tasks');

																					$.append($$anchor, text_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_80 = $.sibling(node_79, 2);

																		$.component(node_80, () => Popover.Description, ($$anchor, Popover_Description) => {
																			Popover_Description($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_13 = $.text('Describe your task in natural language. Copilot will work in the background and\n									open a pull request.');

																					$.append($$anchor, text_13);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_52);
																	},
																	$$slots: { default: true }
																});
															});

															var div_2 = $.sibling(node_78, 2);
															var node_81 = $.child(div_2);

															Textarea(node_81, {
																placeholder: 'Describe your task in natural language.',
																class: 'min-h-32 resize-none'
															});

															$.reset(div_2);
															$.append($$anchor, fragment_51);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_48);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_46);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_30);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
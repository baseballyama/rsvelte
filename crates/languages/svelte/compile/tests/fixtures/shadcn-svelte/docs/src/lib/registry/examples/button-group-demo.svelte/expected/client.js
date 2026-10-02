import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Archive from "@lucide/svelte/icons/archive";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
import Clock from "@lucide/svelte/icons/clock";
import ListFilter from "@lucide/svelte/icons/list-filter";
import MailCheck from "@lucide/svelte/icons/mail-check";
import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
import Tag from "@lucide/svelte/icons/tag";
import Trash2 from "@lucide/svelte/icons/trash-2";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

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

export default function Button_group_demo($$anchor) {
	let label = $.state("personal");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_7();
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
									ArrowLeft($$anchor, {});
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
								size: 'sm',
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Archive');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Button(node_4, {
								size: 'sm',
								variant: 'outline',
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
								size: 'sm',
								variant: 'outline',
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

												Button($$anchor, $.spread_props(props, {
													variant: 'outline',
													size: 'icon-sm',
													'aria-label': 'More Options',
													children: ($$anchor, $$slotProps) => {
														MoreHorizontal($$anchor, {});
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_8, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
											DropdownMenu_Content($$anchor, {
												align: 'end',
												class: 'w-52',
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

																			MailCheck(node_12, {});
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

																			Archive(node_14, {});
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

																			Clock(node_18, {});
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

																			CalendarPlus(node_20, {});
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

																			ListFilter(node_22, {});
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

																						Tag(node_25, {});
																						$.next();
																						$.append($$anchor, fragment_18);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_24, 2);

																			$.component(node_26, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																				DropdownMenu_SubContent($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_19 = $.comment();
																						var node_27 = $.first_child(fragment_19);

																						$.component(node_27, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																							DropdownMenu_RadioGroup($$anchor, {
																								get value() {
																									return $.get(label);
																								},

																								set value($$value) {
																									$.set(label, $$value, true);
																								},

																								children: ($$anchor, $$slotProps) => {
																									var fragment_20 = root_7();
																									var node_28 = $.first_child(fragment_20);

																									$.component(node_28, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
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

																									var node_29 = $.sibling(node_28, 2);

																									$.component(node_29, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
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

																									var node_30 = $.sibling(node_29, 2);

																									$.component(node_30, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
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

													var node_31 = $.sibling(node_16, 2);

													$.component(node_31, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
														DropdownMenu_Separator_1($$anchor, {});
													});

													var node_32 = $.sibling(node_31, 2);

													$.component(node_32, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
														DropdownMenu_Group_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = $.comment();
																var node_33 = $.first_child(fragment_21);

																$.component(node_33, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																	DropdownMenu_Item_5($$anchor, {
																		class: 'text-destructive focus:text-destructive',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_22 = root_9();
																			var node_34 = $.first_child(fragment_22);

																			Trash2(node_34, {});
																			$.next();
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}
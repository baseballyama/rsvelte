import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import Check from "phosphor-svelte/lib/Check";
import FunnelSimple from "phosphor-svelte/lib/FunnelSimple";

const radioCheckedIndicator = ($$anchor, checked = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if (checked()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_svg(`<svg class="text-foreground-alt ml-auto size-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="currentColor"></circle></svg>`);
var root_1 = $.from_html(`<!> <span class="ml-1.5">Filter issue</span>`, 1);
var root_2 = $.from_html(`Status <!>`, 1);
var root_3 = $.from_html(` <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`Issue properties <!>`, 1);
var root_6 = $.from_html(`Priority <!>`, 1);
var root_7 = $.from_html(`Type <!>`, 1);
var root_8 = $.from_html(`<span> </span> <!>`, 1);
var root_9 = $.from_html(`Labels <!>`, 1);
var root_10 = $.from_html(`Product area <!>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_13 = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown_menu_demo_nested($$anchor) {
	let selectedStatus = $.state("in-progress");
	let selectedPriority = $.state("p2");
	let selectedType = $.state("feature");
	let selectedLabel = $.state("customer-facing");
	let digestPrefs = $.state($.proxy(["assignee", "mentions"]));

	const statusItems = [
		{ value: "icebox", label: "Icebox" },
		{ value: "backlog", label: "Backlog" },
		{ value: "todo", label: "Todo" },
		{ value: "in-progress", label: "In progress" },
		{ value: "done", label: "Done" }
	];

	const priorityItems = [
		{ value: "p0", label: "P0 - Critical" },
		{ value: "p1", label: "P1 - High" },
		{ value: "p2", label: "P2 - Medium" },
		{ value: "p3", label: "P3 - Low" }
	];

	const typeItems = [
		{ value: "bug", label: "Bug" },
		{ value: "feature", label: "Feature" },
		{ value: "improvement", label: "Improvement" },
		{ value: "docs", label: "Docs" }
	];

	const labelItems = [
		{ value: "customer-facing", label: "Customer-facing" },
		{ value: "internal-tooling", label: "Internal tooling" },
		{ value: "technical-debt", label: "Technical debt" },
		{ value: "compliance", label: "Compliance" },
		{ value: "platform", label: "Platform" }
	];

	const digestItems = [
		{ value: "assignee", label: "Assignee changes" },
		{ value: "comments", label: "New comments" },
		{ value: "mentions", label: "@mentions" }
	];

	const contentClass = "border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden w-[250px] rounded-xl border px-1 py-1.5";
	const subContentClass = "border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden z-100 w-[230px] rounded-xl border px-1 py-1.5";
	const itemClass = "rounded-button data-highlighted:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none";
	const subTriggerClass = "rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none";
	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_4();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						class: 'border-input text-foreground shadow-btn hover:bg-muted inline-flex h-10 select-none items-center justify-center rounded-full border px-4 text-sm font-medium active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							FunnelSimple(node_3, { class: 'size-5' });
							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									class: contentClass,
									sideOffset: 8,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_13();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												class: itemClass,
												disabled: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Search issues…');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
											DropdownMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_4();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
														DropdownMenu_SubTrigger($$anchor, {
															class: subTriggerClass,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_7 = root_2();
																var node_9 = $.sibling($.first_child(fragment_7));

																CaretRight(node_9, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_8, 2);

													$.component(node_10, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_1) => {
														DropdownMenu_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_11 = $.first_child(fragment_8);

																$.component(node_11, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																	DropdownMenu_SubContent($$anchor, {
																		class: subContentClass,
																		sideOffset: 10,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = $.comment();
																			var node_12 = $.first_child(fragment_9);

																			$.component(node_12, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																				DropdownMenu_RadioGroup($$anchor, {
																					get value() {
																						return $.get(selectedStatus);
																					},

																					set value($$value) {
																						$.set(selectedStatus, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = $.comment();
																						var node_13 = $.first_child(fragment_10);

																						$.each(node_13, 17, () => statusItems, (item) => item.value, ($$anchor, item) => {
																							var fragment_11 = $.comment();
																							var node_14 = $.first_child(fragment_11);

																							{
																								const children = ($$anchor, $$arg0) => {
																									let checked = () => ($$arg0?.()).checked;

																									$.next();

																									var fragment_12 = root_3();
																									var text_1 = $.first_child(fragment_12);
																									var node_15 = $.sibling(text_1);

																									radioCheckedIndicator(node_15, checked);
																									$.template_effect(() => $.set_text(text_1, `${$.get(item).label ?? ''} `));
																									$.append($$anchor, fragment_12);
																								};

																								$.component(node_14, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																									DropdownMenu_RadioItem($$anchor, {
																										get value() {
																											return $.get(item).value;
																										},
																										class: itemClass,
																										children,
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_11);
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

										var node_16 = $.sibling(node_7, 2);

										$.component(node_16, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_1) => {
											DropdownMenu_Sub_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_4();
													var node_17 = $.first_child(fragment_13);

													$.component(node_17, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_1) => {
														DropdownMenu_SubTrigger_1($$anchor, {
															class: subTriggerClass,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_14 = root_5();
																var node_18 = $.sibling($.first_child(fragment_14));

																CaretRight(node_18, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_17, 2);

													$.component(node_19, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_2) => {
														DropdownMenu_Portal_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_20 = $.first_child(fragment_15);

																$.component(node_20, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_1) => {
																	DropdownMenu_SubContent_1($$anchor, {
																		class: subContentClass,
																		sideOffset: 10,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = root_12();
																			var node_21 = $.first_child(fragment_16);

																			$.component(node_21, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_2) => {
																				DropdownMenu_Sub_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = root_4();
																						var node_22 = $.first_child(fragment_17);

																						$.component(node_22, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_2) => {
																							DropdownMenu_SubTrigger_2($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_18 = root_6();
																									var node_23 = $.sibling($.first_child(fragment_18));

																									CaretRight(node_23, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_18);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_24 = $.sibling(node_22, 2);

																						$.component(node_24, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_3) => {
																							DropdownMenu_Portal_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_19 = $.comment();
																									var node_25 = $.first_child(fragment_19);

																									$.component(node_25, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_2) => {
																										DropdownMenu_SubContent_2($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_20 = $.comment();
																												var node_26 = $.first_child(fragment_20);

																												$.component(node_26, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_1) => {
																													DropdownMenu_RadioGroup_1($$anchor, {
																														get value() {
																															return $.get(selectedPriority);
																														},

																														set value($$value) {
																															$.set(selectedPriority, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_21 = $.comment();
																															var node_27 = $.first_child(fragment_21);

																															$.each(node_27, 17, () => priorityItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_22 = $.comment();
																																var node_28 = $.first_child(fragment_22);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_23 = root_3();
																																		var text_2 = $.first_child(fragment_23);
																																		var node_29 = $.sibling(text_2);

																																		radioCheckedIndicator(node_29, checked);
																																		$.template_effect(() => $.set_text(text_2, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_23);
																																	};

																																	$.component(node_28, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																																		DropdownMenu_RadioItem_1($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_22);
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

																			var node_30 = $.sibling(node_21, 2);

																			$.component(node_30, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_3) => {
																				DropdownMenu_Sub_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_24 = root_4();
																						var node_31 = $.first_child(fragment_24);

																						$.component(node_31, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_3) => {
																							DropdownMenu_SubTrigger_3($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_25 = root_7();
																									var node_32 = $.sibling($.first_child(fragment_25));

																									CaretRight(node_32, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_25);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_33 = $.sibling(node_31, 2);

																						$.component(node_33, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_4) => {
																							DropdownMenu_Portal_4($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_26 = $.comment();
																									var node_34 = $.first_child(fragment_26);

																									$.component(node_34, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_3) => {
																										DropdownMenu_SubContent_3($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_27 = $.comment();
																												var node_35 = $.first_child(fragment_27);

																												$.component(node_35, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_2) => {
																													DropdownMenu_RadioGroup_2($$anchor, {
																														get value() {
																															return $.get(selectedType);
																														},

																														set value($$value) {
																															$.set(selectedType, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_28 = $.comment();
																															var node_36 = $.first_child(fragment_28);

																															$.each(node_36, 17, () => typeItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_29 = $.comment();
																																var node_37 = $.first_child(fragment_29);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_30 = root_3();
																																		var text_3 = $.first_child(fragment_30);
																																		var node_38 = $.sibling(text_3);

																																		radioCheckedIndicator(node_38, checked);
																																		$.template_effect(() => $.set_text(text_3, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_30);
																																	};

																																	$.component(node_37, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																																		DropdownMenu_RadioItem_2($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_29);
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

																									$.append($$anchor, fragment_26);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_24);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_39 = $.sibling(node_30, 2);

																			$.component(node_39, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																				DropdownMenu_Separator($$anchor, { class: 'bg-muted -mx-1 my-1 block h-px' });
																			});

																			var node_40 = $.sibling(node_39, 2);

																			$.component(node_40, () => DropdownMenu.CheckboxGroup, ($$anchor, DropdownMenu_CheckboxGroup) => {
																				DropdownMenu_CheckboxGroup($$anchor, {
																					get value() {
																						return $.get(digestPrefs);
																					},

																					set value($$value) {
																						$.set(digestPrefs, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_31 = root_4();
																						var node_41 = $.first_child(fragment_31);

																						$.component(node_41, () => DropdownMenu.GroupHeading, ($$anchor, DropdownMenu_GroupHeading) => {
																							DropdownMenu_GroupHeading($$anchor, {
																								class: 'text-muted-foreground px-3 pb-2 pt-3 text-xs font-medium',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_4 = $.text('Email digest');

																									$.append($$anchor, text_4);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_42 = $.sibling(node_41, 2);

																						$.each(node_42, 17, () => digestItems, (item) => item.value, ($$anchor, item) => {
																							var fragment_32 = $.comment();
																							var node_43 = $.first_child(fragment_32);

																							{
																								const children = ($$anchor, $$arg0) => {
																									let checked = () => ($$arg0?.()).checked;
																									var fragment_33 = root_8();
																									var span = $.first_child(fragment_33);
																									var text_5 = $.only_child(span, true);
																									var node_44 = $.sibling(span, 2);

																									{
																										var consequent_1 = ($$anchor) => {
																											Check($$anchor, { class: 'text-foreground-alt ml-auto size-4 shrink-0' });
																										};

																										$.if(node_44, ($$render) => {
																											if (checked()) $$render(consequent_1);
																										});
																									}

																									$.template_effect(() => $.set_text(text_5, $.get(item).label));
																									$.append($$anchor, fragment_33);
																								};

																								$.component(node_43, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
																									DropdownMenu_CheckboxItem($$anchor, {
																										get value() {
																											return $.get(item).value;
																										},
																										class: itemClass,
																										children,
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_32);
																						});

																						$.append($$anchor, fragment_31);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_45 = $.sibling(node_40, 2);

																			$.component(node_45, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_4) => {
																				DropdownMenu_Sub_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_35 = root_4();
																						var node_46 = $.first_child(fragment_35);

																						$.component(node_46, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_4) => {
																							DropdownMenu_SubTrigger_4($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_36 = root_9();
																									var node_47 = $.sibling($.first_child(fragment_36));

																									CaretRight(node_47, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_36);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_48 = $.sibling(node_46, 2);

																						$.component(node_48, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_5) => {
																							DropdownMenu_Portal_5($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_37 = $.comment();
																									var node_49 = $.first_child(fragment_37);

																									$.component(node_49, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_4) => {
																										DropdownMenu_SubContent_4($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_38 = root_4();
																												var node_50 = $.first_child(fragment_38);

																												$.component(node_50, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_3) => {
																													DropdownMenu_RadioGroup_3($$anchor, {
																														get value() {
																															return $.get(selectedLabel);
																														},

																														set value($$value) {
																															$.set(selectedLabel, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_39 = $.comment();
																															var node_51 = $.first_child(fragment_39);

																															$.each(node_51, 17, () => labelItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_40 = $.comment();
																																var node_52 = $.first_child(fragment_40);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_41 = root_3();
																																		var text_6 = $.first_child(fragment_41);
																																		var node_53 = $.sibling(text_6);

																																		radioCheckedIndicator(node_53, checked);
																																		$.template_effect(() => $.set_text(text_6, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_41);
																																	};

																																	$.component(node_52, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_3) => {
																																		DropdownMenu_RadioItem_3($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_40);
																															});

																															$.append($$anchor, fragment_39);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_54 = $.sibling(node_50, 2);

																												$.component(node_54, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_5) => {
																													DropdownMenu_Sub_5($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_42 = root_4();
																															var node_55 = $.first_child(fragment_42);

																															$.component(node_55, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_5) => {
																																DropdownMenu_SubTrigger_5($$anchor, {
																																	class: subTriggerClass,
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var fragment_43 = root_10();
																																		var node_56 = $.sibling($.first_child(fragment_43));

																																		CaretRight(node_56, { class: 'text-foreground-alt ml-auto size-4' });
																																		$.append($$anchor, fragment_43);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_57 = $.sibling(node_55, 2);

																															$.component(node_57, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_6) => {
																																DropdownMenu_Portal_6($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_44 = $.comment();
																																		var node_58 = $.first_child(fragment_44);

																																		$.component(node_58, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_5) => {
																																			DropdownMenu_SubContent_5($$anchor, {
																																				class: subContentClass,
																																				sideOffset: 10,
																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_45 = root_11();
																																					var node_59 = $.first_child(fragment_45);

																																					$.component(node_59, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																																						DropdownMenu_Item_1($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_7 = $.text('Web app');

																																								$.append($$anchor, text_7);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_60 = $.sibling(node_59, 2);

																																					$.component(node_60, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																																						DropdownMenu_Item_2($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_8 = $.text('Mobile');

																																								$.append($$anchor, text_8);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_61 = $.sibling(node_60, 2);

																																					$.component(node_61, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																																						DropdownMenu_Item_3($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_9 = $.text('CLI');

																																								$.append($$anchor, text_9);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_62 = $.sibling(node_61, 2);

																																					$.component(node_62, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																																						DropdownMenu_Item_4($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_10 = $.text('Marketing site');

																																								$.append($$anchor, text_10);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

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

																															$.append($$anchor, fragment_42);
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

																						$.append($$anchor, fragment_35);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
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

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_1);
}
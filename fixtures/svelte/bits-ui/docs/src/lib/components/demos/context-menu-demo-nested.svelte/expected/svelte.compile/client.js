import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import Check from "phosphor-svelte/lib/Check";
import MouseSimple from "phosphor-svelte/lib/MouseSimple";

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
var root_1 = $.from_html(`<div class="flex flex-col items-center justify-center gap-3 text-center"><!> <span>Right-click this issue card</span></div>`);
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

export default function Context_menu_demo_nested($$anchor) {
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

	$.component(node_1, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_4();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						class: 'rounded-card border-border-input text-muted-foreground flex h-[220px] w-full max-w-[320px] select-none items-center justify-center border-2 border-dashed bg-transparent text-sm font-semibold',
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var node_3 = $.child(div);

							MouseSimple(node_3, { class: 'size-8' });
							$.next(2);
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
								ContextMenu_Content($$anchor, {
									class: contentClass,
									sideOffset: 8,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_13();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
											ContextMenu_Item($$anchor, {
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

										$.component(node_7, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
											ContextMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_4();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
														ContextMenu_SubTrigger($$anchor, {
															class: subTriggerClass,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_6 = root_2();
																var node_9 = $.sibling($.first_child(fragment_6));

																CaretRight(node_9, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_8, 2);

													$.component(node_10, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_1) => {
														ContextMenu_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_11 = $.first_child(fragment_7);

																$.component(node_11, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
																	ContextMenu_SubContent($$anchor, {
																		class: subContentClass,
																		sideOffset: 10,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = $.comment();
																			var node_12 = $.first_child(fragment_8);

																			$.component(node_12, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup) => {
																				ContextMenu_RadioGroup($$anchor, {
																					get value() {
																						return $.get(selectedStatus);
																					},

																					set value($$value) {
																						$.set(selectedStatus, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_13 = $.first_child(fragment_9);

																						$.each(node_13, 17, () => statusItems, (item) => item.value, ($$anchor, item) => {
																							var fragment_10 = $.comment();
																							var node_14 = $.first_child(fragment_10);

																							{
																								const children = ($$anchor, $$arg0) => {
																									let checked = () => ($$arg0?.()).checked;

																									$.next();

																									var fragment_11 = root_3();
																									var text_1 = $.first_child(fragment_11);
																									var node_15 = $.sibling(text_1);

																									radioCheckedIndicator(node_15, checked);
																									$.template_effect(() => $.set_text(text_1, `${$.get(item).label ?? ''} `));
																									$.append($$anchor, fragment_11);
																								};

																								$.component(node_14, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem) => {
																									ContextMenu_RadioItem($$anchor, {
																										get value() {
																											return $.get(item).value;
																										},
																										class: itemClass,
																										children,
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_10);
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

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_7, 2);

										$.component(node_16, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_1) => {
											ContextMenu_Sub_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root_4();
													var node_17 = $.first_child(fragment_12);

													$.component(node_17, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_1) => {
														ContextMenu_SubTrigger_1($$anchor, {
															class: subTriggerClass,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_13 = root_5();
																var node_18 = $.sibling($.first_child(fragment_13));

																CaretRight(node_18, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_17, 2);

													$.component(node_19, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_2) => {
														ContextMenu_Portal_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_20 = $.first_child(fragment_14);

																$.component(node_20, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_1) => {
																	ContextMenu_SubContent_1($$anchor, {
																		class: subContentClass,
																		sideOffset: 10,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = root_12();
																			var node_21 = $.first_child(fragment_15);

																			$.component(node_21, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_2) => {
																				ContextMenu_Sub_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_16 = root_4();
																						var node_22 = $.first_child(fragment_16);

																						$.component(node_22, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_2) => {
																							ContextMenu_SubTrigger_2($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_17 = root_6();
																									var node_23 = $.sibling($.first_child(fragment_17));

																									CaretRight(node_23, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_17);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_24 = $.sibling(node_22, 2);

																						$.component(node_24, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_3) => {
																							ContextMenu_Portal_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_18 = $.comment();
																									var node_25 = $.first_child(fragment_18);

																									$.component(node_25, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_2) => {
																										ContextMenu_SubContent_2($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_19 = $.comment();
																												var node_26 = $.first_child(fragment_19);

																												$.component(node_26, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup_1) => {
																													ContextMenu_RadioGroup_1($$anchor, {
																														get value() {
																															return $.get(selectedPriority);
																														},

																														set value($$value) {
																															$.set(selectedPriority, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_20 = $.comment();
																															var node_27 = $.first_child(fragment_20);

																															$.each(node_27, 17, () => priorityItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_21 = $.comment();
																																var node_28 = $.first_child(fragment_21);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_22 = root_3();
																																		var text_2 = $.first_child(fragment_22);
																																		var node_29 = $.sibling(text_2);

																																		radioCheckedIndicator(node_29, checked);
																																		$.template_effect(() => $.set_text(text_2, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_22);
																																	};

																																	$.component(node_28, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_1) => {
																																		ContextMenu_RadioItem_1($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_21);
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

																						$.append($$anchor, fragment_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_30 = $.sibling(node_21, 2);

																			$.component(node_30, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_3) => {
																				ContextMenu_Sub_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_23 = root_4();
																						var node_31 = $.first_child(fragment_23);

																						$.component(node_31, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_3) => {
																							ContextMenu_SubTrigger_3($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_24 = root_7();
																									var node_32 = $.sibling($.first_child(fragment_24));

																									CaretRight(node_32, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_24);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_33 = $.sibling(node_31, 2);

																						$.component(node_33, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_4) => {
																							ContextMenu_Portal_4($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_25 = $.comment();
																									var node_34 = $.first_child(fragment_25);

																									$.component(node_34, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_3) => {
																										ContextMenu_SubContent_3($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_26 = $.comment();
																												var node_35 = $.first_child(fragment_26);

																												$.component(node_35, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup_2) => {
																													ContextMenu_RadioGroup_2($$anchor, {
																														get value() {
																															return $.get(selectedType);
																														},

																														set value($$value) {
																															$.set(selectedType, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_27 = $.comment();
																															var node_36 = $.first_child(fragment_27);

																															$.each(node_36, 17, () => typeItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_28 = $.comment();
																																var node_37 = $.first_child(fragment_28);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_29 = root_3();
																																		var text_3 = $.first_child(fragment_29);
																																		var node_38 = $.sibling(text_3);

																																		radioCheckedIndicator(node_38, checked);
																																		$.template_effect(() => $.set_text(text_3, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_29);
																																	};

																																	$.component(node_37, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_2) => {
																																		ContextMenu_RadioItem_2($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_28);
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

																									$.append($$anchor, fragment_25);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_23);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_39 = $.sibling(node_30, 2);

																			$.component(node_39, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
																				ContextMenu_Separator($$anchor, { class: 'bg-muted -mx-1 my-1 block h-px' });
																			});

																			var node_40 = $.sibling(node_39, 2);

																			$.component(node_40, () => ContextMenu.CheckboxGroup, ($$anchor, ContextMenu_CheckboxGroup) => {
																				ContextMenu_CheckboxGroup($$anchor, {
																					get value() {
																						return $.get(digestPrefs);
																					},

																					set value($$value) {
																						$.set(digestPrefs, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_30 = root_4();
																						var node_41 = $.first_child(fragment_30);

																						$.component(node_41, () => ContextMenu.GroupHeading, ($$anchor, ContextMenu_GroupHeading) => {
																							ContextMenu_GroupHeading($$anchor, {
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
																							var fragment_31 = $.comment();
																							var node_43 = $.first_child(fragment_31);

																							{
																								const children = ($$anchor, $$arg0) => {
																									let checked = () => ($$arg0?.()).checked;
																									var fragment_32 = root_8();
																									var span = $.first_child(fragment_32);
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
																									$.append($$anchor, fragment_32);
																								};

																								$.component(node_43, () => ContextMenu.CheckboxItem, ($$anchor, ContextMenu_CheckboxItem) => {
																									ContextMenu_CheckboxItem($$anchor, {
																										get value() {
																											return $.get(item).value;
																										},
																										class: itemClass,
																										children,
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_31);
																						});

																						$.append($$anchor, fragment_30);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_45 = $.sibling(node_40, 2);

																			$.component(node_45, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_4) => {
																				ContextMenu_Sub_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_34 = root_4();
																						var node_46 = $.first_child(fragment_34);

																						$.component(node_46, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_4) => {
																							ContextMenu_SubTrigger_4($$anchor, {
																								class: subTriggerClass,
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_35 = root_9();
																									var node_47 = $.sibling($.first_child(fragment_35));

																									CaretRight(node_47, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_35);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_48 = $.sibling(node_46, 2);

																						$.component(node_48, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_5) => {
																							ContextMenu_Portal_5($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_36 = $.comment();
																									var node_49 = $.first_child(fragment_36);

																									$.component(node_49, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_4) => {
																										ContextMenu_SubContent_4($$anchor, {
																											class: subContentClass,
																											sideOffset: 10,
																											children: ($$anchor, $$slotProps) => {
																												var fragment_37 = root_4();
																												var node_50 = $.first_child(fragment_37);

																												$.component(node_50, () => ContextMenu.RadioGroup, ($$anchor, ContextMenu_RadioGroup_3) => {
																													ContextMenu_RadioGroup_3($$anchor, {
																														get value() {
																															return $.get(selectedLabel);
																														},

																														set value($$value) {
																															$.set(selectedLabel, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_38 = $.comment();
																															var node_51 = $.first_child(fragment_38);

																															$.each(node_51, 17, () => labelItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_39 = $.comment();
																																var node_52 = $.first_child(fragment_39);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_40 = root_3();
																																		var text_6 = $.first_child(fragment_40);
																																		var node_53 = $.sibling(text_6);

																																		radioCheckedIndicator(node_53, checked);
																																		$.template_effect(() => $.set_text(text_6, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_40);
																																	};

																																	$.component(node_52, () => ContextMenu.RadioItem, ($$anchor, ContextMenu_RadioItem_3) => {
																																		ContextMenu_RadioItem_3($$anchor, {
																																			get value() {
																																				return $.get(item).value;
																																			},
																																			class: itemClass,
																																			children,
																																			$$slots: { default: true }
																																		});
																																	});
																																}

																																$.append($$anchor, fragment_39);
																															});

																															$.append($$anchor, fragment_38);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_54 = $.sibling(node_50, 2);

																												$.component(node_54, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_5) => {
																													ContextMenu_Sub_5($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_41 = root_4();
																															var node_55 = $.first_child(fragment_41);

																															$.component(node_55, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_5) => {
																																ContextMenu_SubTrigger_5($$anchor, {
																																	class: subTriggerClass,
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var fragment_42 = root_10();
																																		var node_56 = $.sibling($.first_child(fragment_42));

																																		CaretRight(node_56, { class: 'text-foreground-alt ml-auto size-4' });
																																		$.append($$anchor, fragment_42);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_57 = $.sibling(node_55, 2);

																															$.component(node_57, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_6) => {
																																ContextMenu_Portal_6($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_43 = $.comment();
																																		var node_58 = $.first_child(fragment_43);

																																		$.component(node_58, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_5) => {
																																			ContextMenu_SubContent_5($$anchor, {
																																				class: subContentClass,
																																				sideOffset: 10,
																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_44 = root_11();
																																					var node_59 = $.first_child(fragment_44);

																																					$.component(node_59, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
																																						ContextMenu_Item_1($$anchor, {
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

																																					$.component(node_60, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
																																						ContextMenu_Item_2($$anchor, {
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

																																					$.component(node_61, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																																						ContextMenu_Item_3($$anchor, {
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

																																					$.component(node_62, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																																						ContextMenu_Item_4($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_10 = $.text('Marketing site');

																																								$.append($$anchor, text_10);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					$.append($$anchor, fragment_44);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_43);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_41);
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

																						$.append($$anchor, fragment_34);
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

	$.append($$anchor, fragment_1);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, DropdownMenu } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import DotsThree from "phosphor-svelte/lib/DotsThree";
import FunnelSimple from "phosphor-svelte/lib/FunnelSimple";
import MouseSimple from "phosphor-svelte/lib/MouseSimple";

var root = $.from_html(`<!> <span class="ml-1.5">Filter</span>`, 1);
var root_1 = $.from_html(`Status <!>`, 1);
var root_2 = $.from_html(`<span class="ml-auto text-xs">selected</span>`);
var root_3 = $.from_html(` <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`Project properties <!>`, 1);
var root_6 = $.from_html(`Project priority <!>`, 1);
var root_7 = $.from_html(`Project labels <!>`, 1);
var root_8 = $.from_html(`Infrastructure... <!>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`Project lead <!>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<!> <!> <!>`, 1);
var root_13 = $.from_html(`Move to... <!>`, 1);
var root_14 = $.from_html(`Archive... <!>`, 1);
var root_15 = $.from_html(`<div class="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-6"><div class="border-muted bg-background shadow-popover rounded-xl border p-4"><div class="mb-4 flex items-center justify-between gap-3"><div><p class="text-foreground text-sm font-semibold">submenu intent sandbox</p> <p class="text-muted-foreground text-xs">Use this page to stress nested submenu transitions and safe-area debug overlays.</p></div> <div class="text-muted-foreground rounded-button bg-muted px-2.5 py-1.5 text-xs font-medium">depth: 4 levels</div></div> <div class="grid gap-3 md:grid-cols-2"><label class="border-input rounded-button flex items-center gap-3 border px-3 py-2 text-sm"><input type="checkbox" class="size-4"/> <span class="font-medium">debugMode</span> <span class="text-muted-foreground ml-auto text-xs"> </span></label> <label class="border-input rounded-button flex items-center gap-3 border px-3 py-2 text-sm"><span class="font-medium">openDelay</span> <input type="range" class="w-full"/> <span class="text-muted-foreground min-w-[55px] text-right text-xs"> </span></label> <div class="border-input rounded-button flex flex-col gap-2 border px-3 py-2 text-sm"><p class="font-medium">content offsets</p> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">sideOffset</span> <input type="range" class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right"> </span></label> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">alignOffset</span> <input type="range" class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right"> </span></label></div> <div class="border-input rounded-button flex flex-col gap-2 border px-3 py-2 text-sm"><p class="font-medium">subcontent offsets</p> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">sideOffset</span> <input type="range" class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right"> </span></label> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">alignOffset</span> <input type="range" class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right"> </span></label></div></div></div> <div class="grid gap-6 lg:grid-cols-2"><section class="border-muted bg-background rounded-xl border p-5"><div class="mb-4 flex items-center gap-2"><!> <h2 class="text-sm font-semibold">dropdown stress test</h2></div> <!></section> <section class="border-muted bg-background rounded-xl border p-5"><div class="mb-4 flex items-center gap-2"><!> <h2 class="text-sm font-semibold">context-menu stress test</h2></div> <!></section></div></div>`);

export default function _page($$anchor) {
	let debugMode = $.state(true);
	let openDelay = $.state(80);
	let contentSideOffset = $.state(10);
	let contentAlignOffset = $.state(0);
	let subContentSideOffset = $.state(10);
	let subContentAlignOffset = $.state(0);
	let selectedStatus = $.state("icebox");
	let selectedPriority = $.state("p1");
	let selectedLabel = $.state("strategic-initiative");
	let selectedLead = $.state("hunter");
	const debugRootProps = $.derived(() => ({ debugMode: $.get(debugMode) }));

	const statusItems = [
		{ value: "icebox", label: "Icebox" },
		{ value: "backlog", label: "Backlog" },
		{ value: "todo", label: "Todo" },
		{ value: "in-progress", label: "In Progress" },
		{ value: "done", label: "Done" }
	];

	const priorityItems = [
		{ value: "p0", label: "P0 - Critical" },
		{ value: "p1", label: "P1 - High" },
		{ value: "p2", label: "P2 - Medium" },
		{ value: "p3", label: "P3 - Low" }
	];

	const labelItems = [
		{ value: "strategic-initiative", label: "Strategic Initiative" },
		{ value: "customer-facing", label: "Customer Facing" },
		{ value: "internal-tooling", label: "Internal Tooling" },
		{ value: "technical-debt", label: "Technical Debt" },
		{ value: "revenue-impact", label: "Revenue Impact" },
		{ value: "cost-reduction", label: "Cost Reduction" },
		{ value: "compliance", label: "Compliance" },
		{ value: "platform", label: "Platform" },
		{ value: "infrastructure", label: "Infrastructure" },
		{ value: "growth", label: "Growth" }
	];

	const leadItems = [
		{ value: "hunter", label: "@huntabyte" },
		{ value: "pavel", label: "@pavel_stianko" },
		{ value: "adrian", label: "@cokakoala_" },
		{ value: "thomas", label: "@thomasglopes" }
	];

	const triggerClass = "border-input text-foreground shadow-btn hover:bg-muted inline-flex h-10 select-none items-center justify-center rounded-full border px-4 text-sm font-medium active:scale-[0.98]";
	const contentClass = "border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden w-[250px] rounded-xl border px-1 py-1.5";
	const subContentClass = "border-muted bg-background shadow-popover outline-hidden focus-visible:outline-hidden z-100 w-[230px] rounded-xl border px-1 py-1.5";
	const itemClass = "rounded-button data-highlighted:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none";
	const subTriggerClass = "rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted ring-0! ring-transparent! flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none";
	var div = root_15();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var label = $.child(div_2);
	var input = $.child(label);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 4);
	var text = $.only_child(span, true);

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1), 2);

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'min', 0);
	$.set_attribute(input_1, 'max', 400);
	$.set_attribute(input_1, 'step', 20);

	var span_1 = $.sibling(input_1, 2);
	var text_1 = $.only_child(span_1);

	$.reset(label_1);

	var div_3 = $.sibling(label_1, 2);
	var label_2 = $.sibling($.child(div_3), 2);
	var input_2 = $.sibling($.child(label_2), 2);

	$.remove_input_defaults(input_2);
	$.set_attribute(input_2, 'min', -30);
	$.set_attribute(input_2, 'max', 30);
	$.set_attribute(input_2, 'step', 1);

	var span_2 = $.sibling(input_2, 2);
	var text_2 = $.only_child(span_2, true);

	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.sibling($.child(label_3), 2);

	$.remove_input_defaults(input_3);
	$.set_attribute(input_3, 'min', -30);
	$.set_attribute(input_3, 'max', 30);
	$.set_attribute(input_3, 'step', 1);

	var span_3 = $.sibling(input_3, 2);
	var text_3 = $.only_child(span_3, true);

	$.reset(label_3);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var label_4 = $.sibling($.child(div_4), 2);
	var input_4 = $.sibling($.child(label_4), 2);

	$.remove_input_defaults(input_4);
	$.set_attribute(input_4, 'min', -30);
	$.set_attribute(input_4, 'max', 30);
	$.set_attribute(input_4, 'step', 1);

	var span_4 = $.sibling(input_4, 2);
	var text_4 = $.only_child(span_4, true);

	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_5 = $.sibling($.child(label_5), 2);

	$.remove_input_defaults(input_5);
	$.set_attribute(input_5, 'min', -30);
	$.set_attribute(input_5, 'max', 30);
	$.set_attribute(input_5, 'step', 1);

	var span_5 = $.sibling(input_5, 2);
	var text_5 = $.only_child(span_5, true);

	$.reset(label_5);
	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var section = $.child(div_5);
	var div_6 = $.child(section);
	var node = $.child(div_6);

	FunnelSimple(node, { class: 'text-foreground-alt size-5' });
	$.next(2);
	$.reset(div_6);

	var node_1 = $.sibling(div_6, 2);

	$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, $.spread_props(() => $.get(debugRootProps), {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_4();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						class: triggerClass,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_3 = $.first_child(fragment_1);

							DotsThree(node_3, { class: 'size-5' });
							$.next(2);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									class: contentClass,
									get sideOffset() {
										return $.get(contentSideOffset);
									},

									get alignOffset() {
										return $.get(contentAlignOffset);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_12();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												class: itemClass,
												disabled: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Search all...');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
											DropdownMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
														DropdownMenu_SubTrigger($$anchor, {
															class: subTriggerClass,
															get openDelay() {
																return $.get(openDelay);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_5 = root_1();
																var node_9 = $.sibling($.first_child(fragment_5));

																CaretRight(node_9, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_8, 2);

													$.component(node_10, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_1) => {
														DropdownMenu_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_11 = $.first_child(fragment_6);

																$.component(node_11, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																	DropdownMenu_SubContent($$anchor, {
																		class: subContentClass,
																		get sideOffset() {
																			return $.get(subContentSideOffset);
																		},

																		get alignOffset() {
																			return $.get(subContentAlignOffset);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = $.comment();
																			var node_12 = $.first_child(fragment_7);

																			$.component(node_12, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
																				DropdownMenu_RadioGroup($$anchor, {
																					get value() {
																						return $.get(selectedStatus);
																					},

																					set value($$value) {
																						$.set(selectedStatus, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_8 = $.comment();
																						var node_13 = $.first_child(fragment_8);

																						$.each(node_13, 17, () => statusItems, (item) => item.value, ($$anchor, item) => {
																							var fragment_9 = $.comment();
																							var node_14 = $.first_child(fragment_9);

																							{
																								const children = ($$anchor, $$arg0) => {
																									let checked = () => ($$arg0?.()).checked;

																									$.next();

																									var fragment_10 = root_3();
																									var text_7 = $.first_child(fragment_10);
																									var node_15 = $.sibling(text_7);

																									{
																										var consequent = ($$anchor) => {
																											var span_6 = root_2();

																											$.append($$anchor, span_6);
																										};

																										$.if(node_15, ($$render) => {
																											if (checked()) $$render(consequent);
																										});
																									}

																									$.template_effect(() => $.set_text(text_7, `${$.get(item).label ?? ''} `));
																									$.append($$anchor, fragment_10);
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

																							$.append($$anchor, fragment_9);
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

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_7, 2);

										$.component(node_16, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_1) => {
											DropdownMenu_Sub_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_4();
													var node_17 = $.first_child(fragment_11);

													$.component(node_17, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_1) => {
														DropdownMenu_SubTrigger_1($$anchor, {
															class: subTriggerClass,
															get openDelay() {
																return $.get(openDelay);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_12 = root_5();
																var node_18 = $.sibling($.first_child(fragment_12));

																CaretRight(node_18, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_17, 2);

													$.component(node_19, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_2) => {
														DropdownMenu_Portal_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_20 = $.first_child(fragment_13);

																$.component(node_20, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_1) => {
																	DropdownMenu_SubContent_1($$anchor, {
																		class: subContentClass,
																		get sideOffset() {
																			return $.get(subContentSideOffset);
																		},

																		get alignOffset() {
																			return $.get(subContentAlignOffset);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = root_11();
																			var node_21 = $.first_child(fragment_14);

																			$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																				DropdownMenu_Item_1($$anchor, {
																					class: itemClass,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('Project status');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_22 = $.sibling(node_21, 2);

																			$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																				DropdownMenu_Item_2($$anchor, {
																					class: itemClass,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('Project status type');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_23 = $.sibling(node_22, 2);

																			$.component(node_23, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_2) => {
																				DropdownMenu_Sub_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_15 = root_4();
																						var node_24 = $.first_child(fragment_15);

																						$.component(node_24, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_2) => {
																							DropdownMenu_SubTrigger_2($$anchor, {
																								class: subTriggerClass,
																								get openDelay() {
																									return $.get(openDelay);
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_16 = root_6();
																									var node_25 = $.sibling($.first_child(fragment_16));

																									CaretRight(node_25, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_16);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_26 = $.sibling(node_24, 2);

																						$.component(node_26, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_3) => {
																							DropdownMenu_Portal_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_17 = $.comment();
																									var node_27 = $.first_child(fragment_17);

																									$.component(node_27, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_2) => {
																										DropdownMenu_SubContent_2($$anchor, {
																											class: subContentClass,
																											get sideOffset() {
																												return $.get(subContentSideOffset);
																											},

																											get alignOffset() {
																												return $.get(subContentAlignOffset);
																											},

																											children: ($$anchor, $$slotProps) => {
																												var fragment_18 = $.comment();
																												var node_28 = $.first_child(fragment_18);

																												$.component(node_28, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_1) => {
																													DropdownMenu_RadioGroup_1($$anchor, {
																														get value() {
																															return $.get(selectedPriority);
																														},

																														set value($$value) {
																															$.set(selectedPriority, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_19 = $.comment();
																															var node_29 = $.first_child(fragment_19);

																															$.each(node_29, 17, () => priorityItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_20 = $.comment();
																																var node_30 = $.first_child(fragment_20);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_21 = root_3();
																																		var text_10 = $.first_child(fragment_21);
																																		var node_31 = $.sibling(text_10);

																																		{
																																			var consequent_1 = ($$anchor) => {
																																				var span_7 = root_2();

																																				$.append($$anchor, span_7);
																																			};

																																			$.if(node_31, ($$render) => {
																																				if (checked()) $$render(consequent_1);
																																			});
																																		}

																																		$.template_effect(() => $.set_text(text_10, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_21);
																																	};

																																	$.component(node_30, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
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

																																$.append($$anchor, fragment_20);
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

																						$.append($$anchor, fragment_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_32 = $.sibling(node_23, 2);

																			$.component(node_32, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_3) => {
																				DropdownMenu_Sub_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_22 = root_4();
																						var node_33 = $.first_child(fragment_22);

																						$.component(node_33, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_3) => {
																							DropdownMenu_SubTrigger_3($$anchor, {
																								class: subTriggerClass,
																								get openDelay() {
																									return $.get(openDelay);
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_23 = root_7();
																									var node_34 = $.sibling($.first_child(fragment_23));

																									CaretRight(node_34, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_23);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_35 = $.sibling(node_33, 2);

																						$.component(node_35, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_4) => {
																							DropdownMenu_Portal_4($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_24 = $.comment();
																									var node_36 = $.first_child(fragment_24);

																									$.component(node_36, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_3) => {
																										DropdownMenu_SubContent_3($$anchor, {
																											class: subContentClass,
																											get sideOffset() {
																												return $.get(subContentSideOffset);
																											},

																											get alignOffset() {
																												return $.get(subContentAlignOffset);
																											},

																											children: ($$anchor, $$slotProps) => {
																												var fragment_25 = root_4();
																												var node_37 = $.first_child(fragment_25);

																												$.component(node_37, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_2) => {
																													DropdownMenu_RadioGroup_2($$anchor, {
																														get value() {
																															return $.get(selectedLabel);
																														},

																														set value($$value) {
																															$.set(selectedLabel, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_26 = $.comment();
																															var node_38 = $.first_child(fragment_26);

																															$.each(node_38, 17, () => labelItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_27 = $.comment();
																																var node_39 = $.first_child(fragment_27);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_28 = root_3();
																																		var text_11 = $.first_child(fragment_28);
																																		var node_40 = $.sibling(text_11);

																																		{
																																			var consequent_2 = ($$anchor) => {
																																				var span_8 = root_2();

																																				$.append($$anchor, span_8);
																																			};

																																			$.if(node_40, ($$render) => {
																																				if (checked()) $$render(consequent_2);
																																			});
																																		}

																																		$.template_effect(() => $.set_text(text_11, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_28);
																																	};

																																	$.component(node_39, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
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

																																$.append($$anchor, fragment_27);
																															});

																															$.append($$anchor, fragment_26);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_41 = $.sibling(node_37, 2);

																												$.component(node_41, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_4) => {
																													DropdownMenu_Sub_4($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_29 = root_4();
																															var node_42 = $.first_child(fragment_29);

																															$.component(node_42, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_4) => {
																																DropdownMenu_SubTrigger_4($$anchor, {
																																	class: subTriggerClass,
																																	get openDelay() {
																																		return $.get(openDelay);
																																	},

																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var fragment_30 = root_8();
																																		var node_43 = $.sibling($.first_child(fragment_30));

																																		CaretRight(node_43, { class: 'text-foreground-alt ml-auto size-4' });
																																		$.append($$anchor, fragment_30);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_44 = $.sibling(node_42, 2);

																															$.component(node_44, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_5) => {
																																DropdownMenu_Portal_5($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_31 = $.comment();
																																		var node_45 = $.first_child(fragment_31);

																																		$.component(node_45, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_4) => {
																																			DropdownMenu_SubContent_4($$anchor, {
																																				class: subContentClass,
																																				get sideOffset() {
																																					return $.get(subContentSideOffset);
																																				},

																																				get alignOffset() {
																																					return $.get(subContentAlignOffset);
																																				},

																																				children: ($$anchor, $$slotProps) => {
																																					var fragment_32 = root_9();
																																					var node_46 = $.first_child(fragment_32);

																																					$.component(node_46, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																																						DropdownMenu_Item_3($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_12 = $.text('Kubernetes');

																																								$.append($$anchor, text_12);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_47 = $.sibling(node_46, 2);

																																					$.component(node_47, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																																						DropdownMenu_Item_4($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_13 = $.text('Database');

																																								$.append($$anchor, text_13);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_48 = $.sibling(node_47, 2);

																																					$.component(node_48, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
																																						DropdownMenu_Item_5($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_14 = $.text('CI Pipeline');

																																								$.append($$anchor, text_14);
																																							},
																																							$$slots: { default: true }
																																						});
																																					});

																																					var node_49 = $.sibling(node_48, 2);

																																					$.component(node_49, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
																																						DropdownMenu_Item_6($$anchor, {
																																							class: itemClass,
																																							children: ($$anchor, $$slotProps) => {
																																								$.next();

																																								var text_15 = $.text('Observability');

																																								$.append($$anchor, text_15);
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

																						$.append($$anchor, fragment_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_50 = $.sibling(node_32, 2);

																			$.component(node_50, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_5) => {
																				DropdownMenu_Sub_5($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_33 = root_4();
																						var node_51 = $.first_child(fragment_33);

																						$.component(node_51, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_5) => {
																							DropdownMenu_SubTrigger_5($$anchor, {
																								class: subTriggerClass,
																								get openDelay() {
																									return $.get(openDelay);
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_34 = root_10();
																									var node_52 = $.sibling($.first_child(fragment_34));

																									CaretRight(node_52, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_34);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_53 = $.sibling(node_51, 2);

																						$.component(node_53, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_6) => {
																							DropdownMenu_Portal_6($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_35 = $.comment();
																									var node_54 = $.first_child(fragment_35);

																									$.component(node_54, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_5) => {
																										DropdownMenu_SubContent_5($$anchor, {
																											class: subContentClass,
																											get sideOffset() {
																												return $.get(subContentSideOffset);
																											},

																											get alignOffset() {
																												return $.get(subContentAlignOffset);
																											},

																											children: ($$anchor, $$slotProps) => {
																												var fragment_36 = $.comment();
																												var node_55 = $.first_child(fragment_36);

																												$.component(node_55, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup_3) => {
																													DropdownMenu_RadioGroup_3($$anchor, {
																														get value() {
																															return $.get(selectedLead);
																														},

																														set value($$value) {
																															$.set(selectedLead, $$value, true);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_37 = $.comment();
																															var node_56 = $.first_child(fragment_37);

																															$.each(node_56, 17, () => leadItems, (item) => item.value, ($$anchor, item) => {
																																var fragment_38 = $.comment();
																																var node_57 = $.first_child(fragment_38);

																																{
																																	const children = ($$anchor, $$arg0) => {
																																		let checked = () => ($$arg0?.()).checked;

																																		$.next();

																																		var fragment_39 = root_3();
																																		var text_16 = $.first_child(fragment_39);
																																		var node_58 = $.sibling(text_16);

																																		{
																																			var consequent_3 = ($$anchor) => {
																																				var span_9 = root_2();

																																				$.append($$anchor, span_9);
																																			};

																																			$.if(node_58, ($$render) => {
																																				if (checked()) $$render(consequent_3);
																																			});
																																		}

																																		$.template_effect(() => $.set_text(text_16, `${$.get(item).label ?? ''} `));
																																		$.append($$anchor, fragment_39);
																																	};

																																	$.component(node_57, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_3) => {
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

																																$.append($$anchor, fragment_38);
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

																									$.append($$anchor, fragment_35);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_33);
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

													$.append($$anchor, fragment_11);
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_7 = $.child(section_1);
	var node_59 = $.child(div_7);

	MouseSimple(node_59, { class: 'text-foreground-alt size-5' });
	$.next(2);
	$.reset(div_7);

	var node_60 = $.sibling(div_7, 2);

	$.component(node_60, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
		ContextMenu_Root($$anchor, $.spread_props(() => $.get(debugRootProps), {
			children: ($$anchor, $$slotProps) => {
				var fragment_40 = root_4();
				var node_61 = $.first_child(fragment_40);

				$.component(node_61, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
					ContextMenu_Trigger($$anchor, {
						class: 'rounded-card border-input text-muted-foreground flex h-[220px] w-full select-none items-center justify-center border-2 border-dashed bg-transparent text-sm font-semibold',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('right click in this panel');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});
				});

				var node_62 = $.sibling(node_61, 2);

				$.component(node_62, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal) => {
					ContextMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_41 = $.comment();
							var node_63 = $.first_child(fragment_41);

							$.component(node_63, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
								ContextMenu_Content($$anchor, {
									class: contentClass,
									get sideOffset() {
										return $.get(contentSideOffset);
									},

									get alignOffset() {
										return $.get(contentAlignOffset);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_42 = root_12();
										var node_64 = $.first_child(fragment_42);

										$.component(node_64, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
											ContextMenu_Item($$anchor, {
												class: itemClass,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text('Open');

													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										});

										var node_65 = $.sibling(node_64, 2);

										$.component(node_65, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
											ContextMenu_Item_1($$anchor, {
												class: itemClass,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text('Rename');

													$.append($$anchor, text_19);
												},
												$$slots: { default: true }
											});
										});

										var node_66 = $.sibling(node_65, 2);

										$.component(node_66, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub) => {
											ContextMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_43 = root_4();
													var node_67 = $.first_child(fragment_43);

													$.component(node_67, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger) => {
														ContextMenu_SubTrigger($$anchor, {
															class: subTriggerClass,
															get openDelay() {
																return $.get(openDelay);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_44 = root_13();
																var node_68 = $.sibling($.first_child(fragment_44));

																CaretRight(node_68, { class: 'text-foreground-alt ml-auto size-4' });
																$.append($$anchor, fragment_44);
															},
															$$slots: { default: true }
														});
													});

													var node_69 = $.sibling(node_67, 2);

													$.component(node_69, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_1) => {
														ContextMenu_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_45 = $.comment();
																var node_70 = $.first_child(fragment_45);

																$.component(node_70, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent) => {
																	ContextMenu_SubContent($$anchor, {
																		class: subContentClass,
																		get sideOffset() {
																			return $.get(subContentSideOffset);
																		},

																		get alignOffset() {
																			return $.get(subContentAlignOffset);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_46 = root_9();
																			var node_71 = $.first_child(fragment_46);

																			$.component(node_71, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
																				ContextMenu_Item_2($$anchor, {
																					class: itemClass,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_20 = $.text('Backlog');

																						$.append($$anchor, text_20);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_72 = $.sibling(node_71, 2);

																			$.component(node_72, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
																				ContextMenu_Item_3($$anchor, {
																					class: itemClass,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_21 = $.text('In Progress');

																						$.append($$anchor, text_21);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_73 = $.sibling(node_72, 2);

																			$.component(node_73, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_4) => {
																				ContextMenu_Item_4($$anchor, {
																					class: itemClass,
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_22 = $.text('Done');

																						$.append($$anchor, text_22);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_74 = $.sibling(node_73, 2);

																			$.component(node_74, () => ContextMenu.Sub, ($$anchor, ContextMenu_Sub_1) => {
																				ContextMenu_Sub_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_47 = root_4();
																						var node_75 = $.first_child(fragment_47);

																						$.component(node_75, () => ContextMenu.SubTrigger, ($$anchor, ContextMenu_SubTrigger_1) => {
																							ContextMenu_SubTrigger_1($$anchor, {
																								class: subTriggerClass,
																								get openDelay() {
																									return $.get(openDelay);
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var fragment_48 = root_14();
																									var node_76 = $.sibling($.first_child(fragment_48));

																									CaretRight(node_76, { class: 'text-foreground-alt ml-auto size-4' });
																									$.append($$anchor, fragment_48);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_77 = $.sibling(node_75, 2);

																						$.component(node_77, () => ContextMenu.Portal, ($$anchor, ContextMenu_Portal_2) => {
																							ContextMenu_Portal_2($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_49 = $.comment();
																									var node_78 = $.first_child(fragment_49);

																									$.component(node_78, () => ContextMenu.SubContent, ($$anchor, ContextMenu_SubContent_1) => {
																										ContextMenu_SubContent_1($$anchor, {
																											class: subContentClass,
																											get sideOffset() {
																												return $.get(subContentSideOffset);
																											},

																											get alignOffset() {
																												return $.get(subContentAlignOffset);
																											},

																											children: ($$anchor, $$slotProps) => {
																												var fragment_50 = root_9();
																												var node_79 = $.first_child(fragment_50);

																												$.component(node_79, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_5) => {
																													ContextMenu_Item_5($$anchor, {
																														class: itemClass,
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_23 = $.text('Q1 2026');

																															$.append($$anchor, text_23);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_80 = $.sibling(node_79, 2);

																												$.component(node_80, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_6) => {
																													ContextMenu_Item_6($$anchor, {
																														class: itemClass,
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_24 = $.text('Q2 2026');

																															$.append($$anchor, text_24);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_81 = $.sibling(node_80, 2);

																												$.component(node_81, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_7) => {
																													ContextMenu_Item_7($$anchor, {
																														class: itemClass,
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_25 = $.text('Q3 2026');

																															$.append($$anchor, text_25);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_82 = $.sibling(node_81, 2);

																												$.component(node_82, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_8) => {
																													ContextMenu_Item_8($$anchor, {
																														class: itemClass,
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_26 = $.text('Q4 2026');

																															$.append($$anchor, text_26);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_50);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_49);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_47);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_46);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_45);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_43);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_42);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_41);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_40);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(section_1);
	$.reset(div_5);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(debugMode) ? "on" : "off");
		$.set_text(text_1, `${$.get(openDelay) ?? ''}ms`);
		$.set_text(text_2, $.get(contentSideOffset));
		$.set_text(text_3, $.get(contentAlignOffset));
		$.set_text(text_4, $.get(subContentSideOffset));
		$.set_text(text_5, $.get(subContentAlignOffset));
	});

	$.bind_checked(input, () => $.get(debugMode), ($$value) => $.set(debugMode, $$value));
	$.bind_value(input_1, () => $.get(openDelay), ($$value) => $.set(openDelay, $$value));
	$.bind_value(input_2, () => $.get(contentSideOffset), ($$value) => $.set(contentSideOffset, $$value));
	$.bind_value(input_3, () => $.get(contentAlignOffset), ($$value) => $.set(contentAlignOffset, $$value));
	$.bind_value(input_4, () => $.get(subContentSideOffset), ($$value) => $.set(subContentSideOffset, $$value));
	$.bind_value(input_5, () => $.get(subContentAlignOffset), ($$value) => $.set(subContentAlignOffset, $$value));
	$.append($$anchor, div);
}
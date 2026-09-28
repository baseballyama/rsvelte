import * as $ from 'svelte/internal/server';
import { ContextMenu, DropdownMenu } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import DotsThree from "phosphor-svelte/lib/DotsThree";
import FunnelSimple from "phosphor-svelte/lib/FunnelSimple";
import MouseSimple from "phosphor-svelte/lib/MouseSimple";

export default function _page($$renderer) {
	let debugMode = true;
	let openDelay = 80;
	let contentSideOffset = 10;
	let contentAlignOffset = 0;
	let subContentSideOffset = 10;
	let subContentAlignOffset = 0;
	let selectedStatus = "icebox";
	let selectedPriority = "p1";
	let selectedLabel = "strategic-initiative";
	let selectedLead = "hunter";
	const debugRootProps = $.derived(() => ({ debugMode }));

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
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-6"><div class="border-muted bg-background shadow-popover rounded-xl border p-4"><div class="mb-4 flex items-center justify-between gap-3"><div><p class="text-foreground text-sm font-semibold">submenu intent sandbox</p> <p class="text-muted-foreground text-xs">Use this page to stress nested submenu transitions and safe-area debug overlays.</p></div> <div class="text-muted-foreground rounded-button bg-muted px-2.5 py-1.5 text-xs font-medium">depth: 4 levels</div></div> <div class="grid gap-3 md:grid-cols-2"><label class="border-input rounded-button flex items-center gap-3 border px-3 py-2 text-sm"><input type="checkbox"${$.attr('checked', debugMode, true)} class="size-4"/> <span class="font-medium">debugMode</span> <span class="text-muted-foreground ml-auto text-xs">${$.escape(debugMode ? "on" : "off")}</span></label> <label class="border-input rounded-button flex items-center gap-3 border px-3 py-2 text-sm"><span class="font-medium">openDelay</span> <input type="range"${$.attr('min', 0)}${$.attr('max', 400)}${$.attr('step', 20)}${$.attr('value', openDelay)} class="w-full"/> <span class="text-muted-foreground min-w-[55px] text-right text-xs">${$.escape(openDelay)}ms</span></label> <div class="border-input rounded-button flex flex-col gap-2 border px-3 py-2 text-sm"><p class="font-medium">content offsets</p> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">sideOffset</span> <input type="range"${$.attr('min', -30)}${$.attr('max', 30)}${$.attr('step', 1)}${$.attr('value', contentSideOffset)} class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right">${$.escape(contentSideOffset)}</span></label> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">alignOffset</span> <input type="range"${$.attr('min', -30)}${$.attr('max', 30)}${$.attr('step', 1)}${$.attr('value', contentAlignOffset)} class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right">${$.escape(contentAlignOffset)}</span></label></div> <div class="border-input rounded-button flex flex-col gap-2 border px-3 py-2 text-sm"><p class="font-medium">subcontent offsets</p> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">sideOffset</span> <input type="range"${$.attr('min', -30)}${$.attr('max', 30)}${$.attr('step', 1)}${$.attr('value', subContentSideOffset)} class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right">${$.escape(subContentSideOffset)}</span></label> <label class="flex items-center gap-3 text-xs"><span class="min-w-[68px] font-medium">alignOffset</span> <input type="range"${$.attr('min', -30)}${$.attr('max', 30)}${$.attr('step', 1)}${$.attr('value', subContentAlignOffset)} class="w-full"/> <span class="text-muted-foreground min-w-[30px] text-right">${$.escape(subContentAlignOffset)}</span></label></div></div></div> <div class="grid gap-6 lg:grid-cols-2"><section class="border-muted bg-background rounded-xl border p-5"><div class="mb-4 flex items-center gap-2">`);
		FunnelSimple($$renderer, { class: 'text-foreground-alt size-5' });
		$$renderer.push(`<!----> <h2 class="text-sm font-semibold">dropdown stress test</h2></div> `);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, $.spread_props([
				debugRootProps(),
				{
					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								class: triggerClass,
								children: ($$renderer) => {
									DotsThree($$renderer, { class: 'size-5' });
									$$renderer.push(`<!----> <span class="ml-1.5">Filter</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Portal) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Portal($$renderer, {
								children: ($$renderer) => {
									if (DropdownMenu.Content) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Content($$renderer, {
											class: contentClass,
											sideOffset: contentSideOffset,
											alignOffset: contentAlignOffset,
											children: ($$renderer) => {
												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														class: itemClass,
														disabled: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Search all...`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Sub) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Sub($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.SubTrigger) {
																$$renderer.push('<!--[-->');

																DropdownMenu.SubTrigger($$renderer, {
																	class: subTriggerClass,
																	openDelay,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Status `);
																		CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.Portal) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Portal($$renderer, {
																	children: ($$renderer) => {
																		if (DropdownMenu.SubContent) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.SubContent($$renderer, {
																				class: subContentClass,
																				sideOffset: subContentSideOffset,
																				alignOffset: subContentAlignOffset,
																				children: ($$renderer) => {
																					if (DropdownMenu.RadioGroup) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.RadioGroup($$renderer, {
																							get value() {
																								return selectedStatus;
																							},

																							set value($$value) {
																								selectedStatus = $$value;
																								$$settled = false;
																							},

																							children: ($$renderer) => {
																								$$renderer.push(`<!--[-->`);

																								const each_array = $.ensure_array_like(statusItems);

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let item = each_array[$$index];

																									{
																										function children($$renderer, { checked }) {
																											$$renderer.push(`<!---->${$.escape(item.label)} `);

																											if (checked) {
																												$$renderer.push(`<!--[0--><span class="ml-auto text-xs">selected</span>`);
																											} else {
																												$$renderer.push('<!--[-1-->');
																											}

																											$$renderer.push(`<!--]-->`);
																										}

																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: item.value,
																												class: itemClass,
																												children,
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}
																								}

																								$$renderer.push(`<!--]-->`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Sub) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Sub($$renderer, {
														children: ($$renderer) => {
															if (DropdownMenu.SubTrigger) {
																$$renderer.push('<!--[-->');

																DropdownMenu.SubTrigger($$renderer, {
																	class: subTriggerClass,
																	openDelay,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Project properties `);
																		CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.Portal) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Portal($$renderer, {
																	children: ($$renderer) => {
																		if (DropdownMenu.SubContent) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.SubContent($$renderer, {
																				class: subContentClass,
																				sideOffset: subContentSideOffset,
																				alignOffset: subContentAlignOffset,
																				children: ($$renderer) => {
																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							class: itemClass,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Project status`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							class: itemClass,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Project status type`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (DropdownMenu.Sub) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Sub($$renderer, {
																							children: ($$renderer) => {
																								if (DropdownMenu.SubTrigger) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.SubTrigger($$renderer, {
																										class: subTriggerClass,
																										openDelay,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Project priority `);
																											CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																											$$renderer.push(`<!---->`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (DropdownMenu.Portal) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Portal($$renderer, {
																										children: ($$renderer) => {
																											if (DropdownMenu.SubContent) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.SubContent($$renderer, {
																													class: subContentClass,
																													sideOffset: subContentSideOffset,
																													alignOffset: subContentAlignOffset,
																													children: ($$renderer) => {
																														if (DropdownMenu.RadioGroup) {
																															$$renderer.push('<!--[-->');

																															DropdownMenu.RadioGroup($$renderer, {
																																get value() {
																																	return selectedPriority;
																																},

																																set value($$value) {
																																	selectedPriority = $$value;
																																	$$settled = false;
																																},

																																children: ($$renderer) => {
																																	$$renderer.push(`<!--[-->`);

																																	const each_array_1 = $.ensure_array_like(priorityItems);

																																	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																																		let item = each_array_1[$$index_1];

																																		{
																																			function children($$renderer, { checked }) {
																																				$$renderer.push(`<!---->${$.escape(item.label)} `);

																																				if (checked) {
																																					$$renderer.push(`<!--[0--><span class="ml-auto text-xs">selected</span>`);
																																				} else {
																																					$$renderer.push('<!--[-1-->');
																																				}

																																				$$renderer.push(`<!--]-->`);
																																			}

																																			if (DropdownMenu.RadioItem) {
																																				$$renderer.push('<!--[-->');

																																				DropdownMenu.RadioItem($$renderer, {
																																					value: item.value,
																																					class: itemClass,
																																					children,
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		}
																																	}

																																	$$renderer.push(`<!--]-->`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (DropdownMenu.Sub) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Sub($$renderer, {
																							children: ($$renderer) => {
																								if (DropdownMenu.SubTrigger) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.SubTrigger($$renderer, {
																										class: subTriggerClass,
																										openDelay,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Project labels `);
																											CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																											$$renderer.push(`<!---->`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (DropdownMenu.Portal) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Portal($$renderer, {
																										children: ($$renderer) => {
																											if (DropdownMenu.SubContent) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.SubContent($$renderer, {
																													class: subContentClass,
																													sideOffset: subContentSideOffset,
																													alignOffset: subContentAlignOffset,
																													children: ($$renderer) => {
																														if (DropdownMenu.RadioGroup) {
																															$$renderer.push('<!--[-->');

																															DropdownMenu.RadioGroup($$renderer, {
																																get value() {
																																	return selectedLabel;
																																},

																																set value($$value) {
																																	selectedLabel = $$value;
																																	$$settled = false;
																																},

																																children: ($$renderer) => {
																																	$$renderer.push(`<!--[-->`);

																																	const each_array_2 = $.ensure_array_like(labelItems);

																																	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																																		let item = each_array_2[$$index_2];

																																		{
																																			function children($$renderer, { checked }) {
																																				$$renderer.push(`<!---->${$.escape(item.label)} `);

																																				if (checked) {
																																					$$renderer.push(`<!--[0--><span class="ml-auto text-xs">selected</span>`);
																																				} else {
																																					$$renderer.push('<!--[-1-->');
																																				}

																																				$$renderer.push(`<!--]-->`);
																																			}

																																			if (DropdownMenu.RadioItem) {
																																				$$renderer.push('<!--[-->');

																																				DropdownMenu.RadioItem($$renderer, {
																																					value: item.value,
																																					class: itemClass,
																																					children,
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		}
																																	}

																																	$$renderer.push(`<!--]-->`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (DropdownMenu.Sub) {
																															$$renderer.push('<!--[-->');

																															DropdownMenu.Sub($$renderer, {
																																children: ($$renderer) => {
																																	if (DropdownMenu.SubTrigger) {
																																		$$renderer.push('<!--[-->');

																																		DropdownMenu.SubTrigger($$renderer, {
																																			class: subTriggerClass,
																																			openDelay,
																																			children: ($$renderer) => {
																																				$$renderer.push(`<!---->Infrastructure... `);
																																				CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																																				$$renderer.push(`<!---->`);
																																			},
																																			$$slots: { default: true }
																																		});

																																		$$renderer.push('<!--]-->');
																																	} else {
																																		$$renderer.push('<!--[!-->');
																																		$$renderer.push('<!--]-->');
																																	}

																																	$$renderer.push(` `);

																																	if (DropdownMenu.Portal) {
																																		$$renderer.push('<!--[-->');

																																		DropdownMenu.Portal($$renderer, {
																																			children: ($$renderer) => {
																																				if (DropdownMenu.SubContent) {
																																					$$renderer.push('<!--[-->');

																																					DropdownMenu.SubContent($$renderer, {
																																						class: subContentClass,
																																						sideOffset: subContentSideOffset,
																																						alignOffset: subContentAlignOffset,
																																						children: ($$renderer) => {
																																							if (DropdownMenu.Item) {
																																								$$renderer.push('<!--[-->');

																																								DropdownMenu.Item($$renderer, {
																																									class: itemClass,
																																									children: ($$renderer) => {
																																										$$renderer.push(`<!---->Kubernetes`);
																																									},
																																									$$slots: { default: true }
																																								});

																																								$$renderer.push('<!--]-->');
																																							} else {
																																								$$renderer.push('<!--[!-->');
																																								$$renderer.push('<!--]-->');
																																							}

																																							$$renderer.push(` `);

																																							if (DropdownMenu.Item) {
																																								$$renderer.push('<!--[-->');

																																								DropdownMenu.Item($$renderer, {
																																									class: itemClass,
																																									children: ($$renderer) => {
																																										$$renderer.push(`<!---->Database`);
																																									},
																																									$$slots: { default: true }
																																								});

																																								$$renderer.push('<!--]-->');
																																							} else {
																																								$$renderer.push('<!--[!-->');
																																								$$renderer.push('<!--]-->');
																																							}

																																							$$renderer.push(` `);

																																							if (DropdownMenu.Item) {
																																								$$renderer.push('<!--[-->');

																																								DropdownMenu.Item($$renderer, {
																																									class: itemClass,
																																									children: ($$renderer) => {
																																										$$renderer.push(`<!---->CI Pipeline`);
																																									},
																																									$$slots: { default: true }
																																								});

																																								$$renderer.push('<!--]-->');
																																							} else {
																																								$$renderer.push('<!--[!-->');
																																								$$renderer.push('<!--]-->');
																																							}

																																							$$renderer.push(` `);

																																							if (DropdownMenu.Item) {
																																								$$renderer.push('<!--[-->');

																																								DropdownMenu.Item($$renderer, {
																																									class: itemClass,
																																									children: ($$renderer) => {
																																										$$renderer.push(`<!---->Observability`);
																																									},
																																									$$slots: { default: true }
																																								});

																																								$$renderer.push('<!--]-->');
																																							} else {
																																								$$renderer.push('<!--[!-->');
																																								$$renderer.push('<!--]-->');
																																							}
																																						},
																																						$$slots: { default: true }
																																					});

																																					$$renderer.push('<!--]-->');
																																				} else {
																																					$$renderer.push('<!--[!-->');
																																					$$renderer.push('<!--]-->');
																																				}
																																			},
																																			$$slots: { default: true }
																																		});

																																		$$renderer.push('<!--]-->');
																																	} else {
																																		$$renderer.push('<!--[!-->');
																																		$$renderer.push('<!--]-->');
																																	}
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (DropdownMenu.Sub) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Sub($$renderer, {
																							children: ($$renderer) => {
																								if (DropdownMenu.SubTrigger) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.SubTrigger($$renderer, {
																										class: subTriggerClass,
																										openDelay,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Project lead `);
																											CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																											$$renderer.push(`<!---->`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (DropdownMenu.Portal) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Portal($$renderer, {
																										children: ($$renderer) => {
																											if (DropdownMenu.SubContent) {
																												$$renderer.push('<!--[-->');

																												DropdownMenu.SubContent($$renderer, {
																													class: subContentClass,
																													sideOffset: subContentSideOffset,
																													alignOffset: subContentAlignOffset,
																													children: ($$renderer) => {
																														if (DropdownMenu.RadioGroup) {
																															$$renderer.push('<!--[-->');

																															DropdownMenu.RadioGroup($$renderer, {
																																get value() {
																																	return selectedLead;
																																},

																																set value($$value) {
																																	selectedLead = $$value;
																																	$$settled = false;
																																},

																																children: ($$renderer) => {
																																	$$renderer.push(`<!--[-->`);

																																	const each_array_3 = $.ensure_array_like(leadItems);

																																	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																																		let item = each_array_3[$$index_3];

																																		{
																																			function children($$renderer, { checked }) {
																																				$$renderer.push(`<!---->${$.escape(item.label)} `);

																																				if (checked) {
																																					$$renderer.push(`<!--[0--><span class="ml-auto text-xs">selected</span>`);
																																				} else {
																																					$$renderer.push('<!--[-1-->');
																																				}

																																				$$renderer.push(`<!--]-->`);
																																			}

																																			if (DropdownMenu.RadioItem) {
																																				$$renderer.push('<!--[-->');

																																				DropdownMenu.RadioItem($$renderer, {
																																					value: item.value,
																																					class: itemClass,
																																					children,
																																					$$slots: { default: true }
																																				});

																																				$$renderer.push('<!--]-->');
																																			} else {
																																				$$renderer.push('<!--[!-->');
																																				$$renderer.push('<!--]-->');
																																			}
																																		}
																																	}

																																	$$renderer.push(`<!--]-->`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</section> <section class="border-muted bg-background rounded-xl border p-5"><div class="mb-4 flex items-center gap-2">`);
		MouseSimple($$renderer, { class: 'text-foreground-alt size-5' });
		$$renderer.push(`<!----> <h2 class="text-sm font-semibold">context-menu stress test</h2></div> `);

		if (ContextMenu.Root) {
			$$renderer.push('<!--[-->');

			ContextMenu.Root($$renderer, $.spread_props([
				debugRootProps(),
				{
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'rounded-card border-input text-muted-foreground flex h-[220px] w-full select-none items-center justify-center border-2 border-dashed bg-transparent text-sm font-semibold',
								children: ($$renderer) => {
									$$renderer.push(`<!---->right click in this panel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ContextMenu.Portal) {
							$$renderer.push('<!--[-->');

							ContextMenu.Portal($$renderer, {
								children: ($$renderer) => {
									if (ContextMenu.Content) {
										$$renderer.push('<!--[-->');

										ContextMenu.Content($$renderer, {
											class: contentClass,
											sideOffset: contentSideOffset,
											alignOffset: contentAlignOffset,
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														class: itemClass,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Open`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														class: itemClass,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Rename`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Sub) {
													$$renderer.push('<!--[-->');

													ContextMenu.Sub($$renderer, {
														children: ($$renderer) => {
															if (ContextMenu.SubTrigger) {
																$$renderer.push('<!--[-->');

																ContextMenu.SubTrigger($$renderer, {
																	class: subTriggerClass,
																	openDelay,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Move to... `);
																		CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (ContextMenu.Portal) {
																$$renderer.push('<!--[-->');

																ContextMenu.Portal($$renderer, {
																	children: ($$renderer) => {
																		if (ContextMenu.SubContent) {
																			$$renderer.push('<!--[-->');

																			ContextMenu.SubContent($$renderer, {
																				class: subContentClass,
																				sideOffset: subContentSideOffset,
																				alignOffset: subContentAlignOffset,
																				children: ($$renderer) => {
																					if (ContextMenu.Item) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.Item($$renderer, {
																							class: itemClass,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Backlog`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (ContextMenu.Item) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.Item($$renderer, {
																							class: itemClass,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->In Progress`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (ContextMenu.Item) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.Item($$renderer, {
																							class: itemClass,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Done`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (ContextMenu.Sub) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.Sub($$renderer, {
																							children: ($$renderer) => {
																								if (ContextMenu.SubTrigger) {
																									$$renderer.push('<!--[-->');

																									ContextMenu.SubTrigger($$renderer, {
																										class: subTriggerClass,
																										openDelay,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Archive... `);
																											CaretRight($$renderer, { class: 'text-foreground-alt ml-auto size-4' });
																											$$renderer.push(`<!---->`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (ContextMenu.Portal) {
																									$$renderer.push('<!--[-->');

																									ContextMenu.Portal($$renderer, {
																										children: ($$renderer) => {
																											if (ContextMenu.SubContent) {
																												$$renderer.push('<!--[-->');

																												ContextMenu.SubContent($$renderer, {
																													class: subContentClass,
																													sideOffset: subContentSideOffset,
																													alignOffset: subContentAlignOffset,
																													children: ($$renderer) => {
																														if (ContextMenu.Item) {
																															$$renderer.push('<!--[-->');

																															ContextMenu.Item($$renderer, {
																																class: itemClass,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Q1 2026`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (ContextMenu.Item) {
																															$$renderer.push('<!--[-->');

																															ContextMenu.Item($$renderer, {
																																class: itemClass,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Q2 2026`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (ContextMenu.Item) {
																															$$renderer.push('<!--[-->');

																															ContextMenu.Item($$renderer, {
																																class: itemClass,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Q3 2026`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														if (ContextMenu.Item) {
																															$$renderer.push('<!--[-->');

																															ContextMenu.Item($$renderer, {
																																class: itemClass,
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Q4 2026`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</section></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
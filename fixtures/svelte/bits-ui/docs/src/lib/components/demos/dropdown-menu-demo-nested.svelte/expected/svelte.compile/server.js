import * as $ from 'svelte/internal/server';
import { DropdownMenu } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import Check from "phosphor-svelte/lib/Check";
import FunnelSimple from "phosphor-svelte/lib/FunnelSimple";

function radioCheckedIndicator($$renderer, checked) {
	if (checked) {
		$$renderer.push(`<!--[0--><svg class="text-foreground-alt ml-auto size-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="currentColor"></circle></svg>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

export default function Dropdown_menu_demo_nested($$renderer) {
	let selectedStatus = "in-progress";
	let selectedPriority = "p2";
	let selectedType = "feature";
	let selectedLabel = "customer-facing";
	let digestPrefs = ["assignee", "mentions"];

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
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: 'border-input text-foreground shadow-btn hover:bg-muted inline-flex h-10 select-none items-center justify-center rounded-full border px-4 text-sm font-medium active:scale-[0.98]',
							children: ($$renderer) => {
								FunnelSimple($$renderer, { class: 'size-5' });
								$$renderer.push(`<!----> <span class="ml-1.5">Filter issue</span>`);
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
										sideOffset: 8,
										children: ($$renderer) => {
											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													class: itemClass,
													disabled: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Search issues…`);
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
																			sideOffset: 10,
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
																										radioCheckedIndicator($$renderer, checked);
																										$$renderer.push(`<!---->`);
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
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Issue properties `);
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
																			sideOffset: 10,
																			children: ($$renderer) => {
																				if (DropdownMenu.Sub) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Sub($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.SubTrigger) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.SubTrigger($$renderer, {
																									class: subTriggerClass,
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Priority `);
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
																												sideOffset: 10,
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
																																			radioCheckedIndicator($$renderer, checked);
																																			$$renderer.push(`<!---->`);
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
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Type `);
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
																												sideOffset: 10,
																												children: ($$renderer) => {
																													if (DropdownMenu.RadioGroup) {
																														$$renderer.push('<!--[-->');

																														DropdownMenu.RadioGroup($$renderer, {
																															get value() {
																																return selectedType;
																															},

																															set value($$value) {
																																selectedType = $$value;
																																$$settled = false;
																															},

																															children: ($$renderer) => {
																																$$renderer.push(`<!--[-->`);

																																const each_array_2 = $.ensure_array_like(typeItems);

																																for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																																	let item = each_array_2[$$index_2];

																																	{
																																		function children($$renderer, { checked }) {
																																			$$renderer.push(`<!---->${$.escape(item.label)} `);
																																			radioCheckedIndicator($$renderer, checked);
																																			$$renderer.push(`<!---->`);
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

																				if (DropdownMenu.Separator) {
																					$$renderer.push('<!--[-->');
																					DropdownMenu.Separator($$renderer, { class: 'bg-muted -mx-1 my-1 block h-px' });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.CheckboxGroup) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.CheckboxGroup($$renderer, {
																						get value() {
																							return digestPrefs;
																						},

																						set value($$value) {
																							digestPrefs = $$value;
																							$$settled = false;
																						},

																						children: ($$renderer) => {
																							if (DropdownMenu.GroupHeading) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.GroupHeading($$renderer, {
																									class: 'text-muted-foreground px-3 pb-2 pt-3 text-xs font-medium',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Email digest`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` <!--[-->`);

																							const each_array_3 = $.ensure_array_like(digestItems);

																							for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																								let item = each_array_3[$$index_3];

																								{
																									function children($$renderer, { checked }) {
																										$$renderer.push(`<span>${$.escape(item.label)}</span> `);

																										if (checked) {
																											$$renderer.push('<!--[0-->');
																											Check($$renderer, { class: 'text-foreground-alt ml-auto size-4 shrink-0' });
																										} else {
																											$$renderer.push('<!--[-1-->');
																										}

																										$$renderer.push(`<!--]-->`);
																									}

																									if (DropdownMenu.CheckboxItem) {
																										$$renderer.push('<!--[-->');

																										DropdownMenu.CheckboxItem($$renderer, {
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
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Labels `);
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
																												sideOffset: 10,
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

																																const each_array_4 = $.ensure_array_like(labelItems);

																																for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																																	let item = each_array_4[$$index_4];

																																	{
																																		function children($$renderer, { checked }) {
																																			$$renderer.push(`<!---->${$.escape(item.label)} `);
																																			radioCheckedIndicator($$renderer, checked);
																																			$$renderer.push(`<!---->`);
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
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!---->Product area `);
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
																																					sideOffset: 10,
																																					children: ($$renderer) => {
																																						if (DropdownMenu.Item) {
																																							$$renderer.push('<!--[-->');

																																							DropdownMenu.Item($$renderer, {
																																								class: itemClass,
																																								children: ($$renderer) => {
																																									$$renderer.push(`<!---->Web app`);
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
																																									$$renderer.push(`<!---->Mobile`);
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
																																									$$renderer.push(`<!---->CLI`);
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
																																									$$renderer.push(`<!---->Marketing site`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
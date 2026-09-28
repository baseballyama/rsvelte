import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Model_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mode = "auto";
		let model = "gpt-5.1";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Model Selector',
				children: ($$renderer) => {
					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
							children: ($$renderer) => {
								if (DropdownMenu.Trigger) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Trigger($$renderer, {
										class: cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2"),
										children: ($$renderer) => {
											$$renderer.push(`<!---->ChatGPT 5.1 `);

											IconPlaceholder($$renderer, {
												lucide: 'ChevronDownIcon',
												tabler: 'IconChevronDown',
												hugeicons: 'ArrowDown01Icon',
												phosphor: 'CaretDownIcon',
												remixicon: 'RiArrowDownSLine',
												class: 'size-4 text-muted-foreground'
											});

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

								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										class: 'w-60',
										align: 'start',
										children: ($$renderer) => {
											if (DropdownMenu.Group) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Group($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Label) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Label($$renderer, {
																class: 'text-xs font-normal text-muted-foreground',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->GPT-5.1`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.RadioGroup) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioGroup($$renderer, {
																get value() {
																	return mode;
																},

																set value($$value) {
																	mode = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	if (DropdownMenu.RadioItem) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.RadioItem($$renderer, {
																			value: 'auto',
																			children: ($$renderer) => {
																				if (Item.Root) {
																					$$renderer.push('<!--[-->');

																					Item.Root($$renderer, {
																						size: 'xs',
																						class: 'p-0',
																						children: ($$renderer) => {
																							if (Item.Content) {
																								$$renderer.push('<!--[-->');

																								Item.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Item.Title) {
																											$$renderer.push('<!--[-->');

																											Item.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Auto`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Item.Description) {
																											$$renderer.push('<!--[-->');

																											Item.Description($$renderer, {
																												class: 'text-xs',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Decides how long to think`);
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

																	if (DropdownMenu.RadioItem) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.RadioItem($$renderer, {
																			value: 'instant',
																			children: ($$renderer) => {
																				if (Item.Root) {
																					$$renderer.push('<!--[-->');

																					Item.Root($$renderer, {
																						size: 'xs',
																						class: 'p-0',
																						children: ($$renderer) => {
																							if (Item.Content) {
																								$$renderer.push('<!--[-->');

																								Item.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Item.Title) {
																											$$renderer.push('<!--[-->');

																											Item.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Instant`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Item.Description) {
																											$$renderer.push('<!--[-->');

																											Item.Description($$renderer, {
																												class: 'text-xs',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Answers right away`);
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

																	if (DropdownMenu.RadioItem) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.RadioItem($$renderer, {
																			value: 'thinking',
																			children: ($$renderer) => {
																				if (Item.Root) {
																					$$renderer.push('<!--[-->');

																					Item.Root($$renderer, {
																						size: 'xs',
																						class: 'p-0',
																						children: ($$renderer) => {
																							if (Item.Content) {
																								$$renderer.push('<!--[-->');

																								Item.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Item.Title) {
																											$$renderer.push('<!--[-->');

																											Item.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Thinking`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Item.Description) {
																											$$renderer.push('<!--[-->');

																											Item.Description($$renderer, {
																												class: 'text-xs',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Thinks longer for better answers`);
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

											if (DropdownMenu.Separator) {
												$$renderer.push('<!--[-->');
												DropdownMenu.Separator($$renderer, {});
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
																children: ($$renderer) => {
																	$$renderer.push(`<span class="font-medium">Legacy models</span>`);
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
																			children: ($$renderer) => {
																				if (DropdownMenu.Group) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Group($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.RadioGroup) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.RadioGroup($$renderer, {
																									get value() {
																										return model;
																									},

																									set value($$value) {
																										model = $$value;
																										$$settled = false;
																									},

																									children: ($$renderer) => {
																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'gpt-4',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->GPT-4`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'gpt-4-turbo',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->GPT-4 Turbo`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'gpt-3.5',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->GPT-3.5`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
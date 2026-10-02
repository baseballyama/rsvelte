import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Alert, AlertDescription } from "$lib/registry/ui/alert/index.js";
import { badgeVariants } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Create_project_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const categories = [
			{ id: "homework", label: "Homework" },
			{ id: "writing", label: "Writing" },
			{ id: "health", label: "Health" },
			{ id: "travel", label: "Travel" }
		];

		let projectName = "";
		let selectedCategory = categories[0].id;
		let memorySetting = "default";
		let selectedColor = "var(--foreground)";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Create Project',
				class: 'items-center justify-center',
				children: ($$renderer) => {
					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							class: 'w-full max-w-sm',
							children: ($$renderer) => {
								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										children: ($$renderer) => {
											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create Project`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Description) {
												$$renderer.push('<!--[-->');

												Card.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Start a new project to keep chats, files, and custom instructions in one place.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Card.Action) {
												$$renderer.push('<!--[-->');

												Card.Action($$renderer, {
													children: ($$renderer) => {
														if (DropdownMenu.Root) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Root($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			Button($$renderer, $.spread_props([
																				{ variant: 'ghost', size: 'icon' },
																				props,
																				{
																					children: ($$renderer) => {
																						IconPlaceholder($$renderer, {
																							lucide: 'SettingsIcon',
																							tabler: 'IconSettings',
																							hugeicons: 'Settings01Icon',
																							phosphor: 'GearIcon',
																							remixicon: 'RiSettingsLine'
																						});

																						$$renderer.push(`<!----> <span class="sr-only">Memory</span>`);
																					},
																					$$slots: { default: true }
																				}
																			]));
																		}

																		if (DropdownMenu.Trigger) {
																			$$renderer.push('<!--[-->');
																			DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	if (DropdownMenu.Content) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Content($$renderer, {
																			align: 'end',
																			class: 'w-72',
																			children: ($$renderer) => {
																				if (DropdownMenu.Group) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Group($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.RadioGroup) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.RadioGroup($$renderer, {
																									get value() {
																										return memorySetting;
																									},

																									set value($$value) {
																										memorySetting = $$value;
																										$$settled = false;
																									},

																									children: ($$renderer) => {
																										if (DropdownMenu.RadioItem) {
																											$$renderer.push('<!--[-->');

																											DropdownMenu.RadioItem($$renderer, {
																												value: 'default',
																												children: ($$renderer) => {
																													if (Item.Root) {
																														$$renderer.push('<!--[-->');

																														Item.Root($$renderer, {
																															size: 'xs',
																															children: ($$renderer) => {
																																if (Item.Content) {
																																	$$renderer.push('<!--[-->');

																																	Item.Content($$renderer, {
																																		children: ($$renderer) => {
																																			if (Item.Title) {
																																				$$renderer.push('<!--[-->');

																																				Item.Title($$renderer, {
																																					children: ($$renderer) => {
																																						$$renderer.push(`<!---->Default`);
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
																																						$$renderer.push(`<!---->Project can access memories from outside chats, and vice versa.`);
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
																												value: 'project-only',
																												children: ($$renderer) => {
																													if (Item.Root) {
																														$$renderer.push('<!--[-->');

																														Item.Root($$renderer, {
																															size: 'xs',
																															children: ($$renderer) => {
																																if (Item.Content) {
																																	$$renderer.push('<!--[-->');

																																	Item.Content($$renderer, {
																																		children: ($$renderer) => {
																																			if (Item.Title) {
																																				$$renderer.push('<!--[-->');

																																				Item.Title($$renderer, {
																																					children: ($$renderer) => {
																																						$$renderer.push(`<!---->Project Only`);
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
																																						$$renderer.push(`<!---->Project can only access its own memories. Its memories are hidden from
												outside chats.`);
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

																				if (DropdownMenu.Group) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Group($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.Label) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Label($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Note that this setting can't be changed later.`);
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

								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										children: ($$renderer) => {
											if (Field.Group) {
												$$renderer.push('<!--[-->');

												Field.Group($$renderer, {
													children: ($$renderer) => {
														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'project-name',
																			class: 'sr-only',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Project Name`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (InputGroup.Root) {
																		$$renderer.push('<!--[-->');

																		InputGroup.Root($$renderer, {
																			children: ($$renderer) => {
																				if (InputGroup.Input) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Input($$renderer, {
																						id: 'project-name',
																						placeholder: 'Copenhagen Trip',
																						value: projectName,
																						oninput: (e) => {
																							projectName = e.currentTarget.value;
																						}
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (InputGroup.Addon) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Addon($$renderer, {
																						children: ($$renderer) => {
																							if (Popover.Root) {
																								$$renderer.push('<!--[-->');

																								Popover.Root($$renderer, {
																									children: ($$renderer) => {
																										{
																											function child($$renderer, { props }) {
																												if (InputGroup.Button) {
																													$$renderer.push('<!--[-->');

																													InputGroup.Button($$renderer, $.spread_props([
																														{ variant: 'ghost', size: 'icon-xs' },
																														props,
																														{
																															children: ($$renderer) => {
																																IconPlaceholder($$renderer, {
																																	style: `--color: ${selectedColor}`,
																																	lucide: 'FolderIcon',
																																	tabler: 'IconFolder',
																																	hugeicons: 'FolderIcon',
																																	phosphor: 'FolderIcon',
																																	remixicon: 'RiFolderLine',
																																	class: 'text-(--color)'
																																});
																															},
																															$$slots: { default: true }
																														}
																													]));

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											}

																											if (Popover.Trigger) {
																												$$renderer.push('<!--[-->');
																												Popover.Trigger($$renderer, { child, $$slots: { child: true } });
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										}

																										$$renderer.push(` `);

																										if (Popover.Content) {
																											$$renderer.push('<!--[-->');

																											Popover.Content($$renderer, {
																												align: 'start',
																												class: 'w-60 p-3',
																												children: ($$renderer) => {
																													$$renderer.push(`<div class="flex flex-wrap gap-2"><!--[-->`);

																													const each_array = $.ensure_array_like([
																														"var(--foreground)",
																														"#fa423e",
																														"#f59e0b",
																														"#8b5cf6",
																														"#ec4899",
																														"#10b981",
																														"#6366f1",
																														"#14b8a6",
																														"#f97316",
																														"#fbbc04"
																													]);

																													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																														let color = each_array[$$index];

																														Button($$renderer, {
																															size: 'icon',
																															variant: 'ghost',
																															class: 'rounded-full p-1',
																															style: `--color: ${color}`,
																															'data-checked': selectedColor === color,
																															onclick: () => {
																																selectedColor = color;
																															},

																															children: ($$renderer) => {
																																$$renderer.push(`<span class="size-5 rounded-full bg-(--color) ring-2 ring-transparent ring-offset-2 ring-offset-(--color) group-data-[checked=true]/button:ring-(--color) group-data-[checked=true]/button:ring-offset-background"></span> <span class="sr-only">${$.escape(color)}</span>`);
																															},
																															$$slots: { default: true }
																														});
																													}

																													$$renderer.push(`<!--]--></div>`);
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

																	if (Field.Description) {
																		$$renderer.push('<!--[-->');

																		Field.Description($$renderer, {
																			class: 'flex flex-wrap gap-2',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(categories);

																				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																					let category = each_array_1[$$index_1];

																					$$renderer.push(`<button type="button"${$.attr('data-checked', selectedCategory === category.id)}${$.attr_class($.clsx(cn(
																						badgeVariants({
																							variant: selectedCategory === category.id ? "default" : "outline"
																						}),
																						"group/badge cursor-pointer"
																					)))}>`);

																					IconPlaceholder($$renderer, {
																						lucide: 'CircleCheckIcon',
																						tabler: 'IconCircleCheck',
																						hugeicons: 'CheckmarkCircle02Icon',
																						phosphor: 'CheckCircleIcon',
																						remixicon: 'RiCheckboxCircleLine',
																						'data-icon': 'inline-start',
																						class: 'hidden group-data-[checked=true]/badge:inline'
																					});

																					$$renderer.push(`<!----> ${$.escape(category.label)}</button>`);
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

														$$renderer.push(` `);

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	Alert($$renderer, {
																		class: 'bg-muted',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'LightbulbIcon',
																				tabler: 'IconBulb',
																				hugeicons: 'BulbIcon',
																				phosphor: 'LightbulbIcon',
																				remixicon: 'RiLightbulbLine'
																			});

																			$$renderer.push(`<!----> `);

																			AlertDescription($$renderer, {
																				class: 'text-xs',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Projects keep chats, files, and custom instructions in one place. Use them for ongoing
							work, or just to keep things tidy.`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});
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
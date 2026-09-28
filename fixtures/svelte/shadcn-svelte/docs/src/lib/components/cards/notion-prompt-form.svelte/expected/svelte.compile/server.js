import * as $ from 'svelte/internal/server';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import AtIcon from "@lucide/svelte/icons/at-sign";
import BookIcon from "@lucide/svelte/icons/book";
import CirclePlusIcon from "@lucide/svelte/icons/circle-plus";
import GlobeIcon from "@lucide/svelte/icons/globe";
import AppsIcon from "@lucide/svelte/icons/grid-3x3";
import PaperclipIcon from "@lucide/svelte/icons/paperclip";
import PlusIcon from "@lucide/svelte/icons/plus";
import XIcon from "@lucide/svelte/icons/x";
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Avatar, AvatarFallback, AvatarImage } from "$lib/registry/ui/avatar/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

function MentionableIcon($$renderer, { item }) {
	if (item.type === "page") {
		$$renderer.push(`<!--[0--><span class="flex size-4 items-center justify-center">${$.escape(item.image)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');

		Avatar($$renderer, {
			class: 'size-4',
			children: ($$renderer) => {
				AvatarImage($$renderer, { src: item.image });
				$$renderer.push(`<!----> `);

				AvatarFallback($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.title[0])}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]-->`);
}

export default function Notion_prompt_form($$renderer) {
	const SAMPLE_DATA = {
		mentionable: [
			{ type: "page", title: "Meeting Notes", image: "📝" },
			{ type: "page", title: "Project Dashboard", image: "📊" },
			{ type: "page", title: "Ideas & Brainstorming", image: "💡" },
			{ type: "page", title: "Calendar & Events", image: "📅" },
			{ type: "page", title: "Documentation", image: "📚" },
			{ type: "page", title: "Goals & Objectives", image: "🎯" },
			{ type: "page", title: "Budget Planning", image: "💰" },
			{ type: "page", title: "Team Directory", image: "👥" },
			{ type: "page", title: "Technical Specs", image: "🔧" },
			{ type: "page", title: "Analytics Report", image: "📈" },
			{
				type: "user",
				title: "shadcn",
				image: "https://github.com/shadcn.png",
				workspace: "Workspace"
			},

			{
				type: "user",
				title: "maxleiter",
				image: "https://github.com/maxleiter.png",
				workspace: "Workspace"
			},

			{
				type: "user",
				title: "evilrabbit",
				image: "https://github.com/evilrabbit.png",
				workspace: "Workspace"
			}
		],
		models: [
			{ name: "Auto" },
			{ name: "Agent Mode", badge: "Beta" },
			{ name: "Plan Mode" }
		]
	};

	let mentions = [];
	let mentionPopoverOpen = false;
	let modelPopoverOpen = false;
	let selectedModel = SAMPLE_DATA.models[0];
	let scopeMenuOpen = false;

	const grouped = $.derived(() => () => {
		return SAMPLE_DATA.mentionable.reduce(
			(acc, item) => {
				const isAvailable = !mentions.includes(item.title);

				if (isAvailable) {
					if (!acc[item.type]) {
						acc[item.type] = [];
					}

					acc[item.type].push(item);
				}

				return acc;
			},
			{}
		);
	});

	const hasMentions = $.derived(() => mentions.length > 0);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form class="[--radius:1.2rem]">`);

		if (Field.Group) {
			$$renderer.push('<!--[-->');

			Field.Group($$renderer, {
				children: ($$renderer) => {
					if (Field.Label) {
						$$renderer.push('<!--[-->');

						Field.Label($$renderer, {
							for: 'notion-prompt',
							class: 'sr-only',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Prompt`);
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
								if (InputGroup.Textarea) {
									$$renderer.push('<!--[-->');

									InputGroup.Textarea($$renderer, {
										id: 'notion-prompt',
										placeholder: 'Ask, search, or make anything...'
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
										align: 'block-start',
										children: ($$renderer) => {
											if (Popover.Root) {
												$$renderer.push('<!--[-->');

												Popover.Root($$renderer, {
													get open() {
														return mentionPopoverOpen;
													},

													set open($$value) {
														mentionPopoverOpen = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Tooltip.Root) {
															$$renderer.push('<!--[-->');

															Tooltip.Root($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			{
																				function child($$renderer, { props }) {
																					if (InputGroup.Button) {
																						$$renderer.push('<!--[-->');

																						InputGroup.Button($$renderer, $.spread_props([
																							props,
																							{
																								variant: 'outline',
																								size: !hasMentions() ? "sm" : "icon-sm",
																								class: 'rounded-full transition-transform',
																								children: ($$renderer) => {
																									AtIcon($$renderer, {});
																									$$renderer.push(`<!----> ${$.escape(!hasMentions() && "Add context")}`);
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
																					Popover.Trigger($$renderer, $.spread_props([props, { child, $$slots: { child: true } }]));
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}
																		}

																		if (Tooltip.Trigger) {
																			$$renderer.push('<!--[-->');
																			Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	if (Tooltip.Content) {
																		$$renderer.push('<!--[-->');

																		Tooltip.Content($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Mention a person, page, or date`);
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

														if (Popover.Content) {
															$$renderer.push('<!--[-->');

															Popover.Content($$renderer, {
																class: 'p-0 [--radius:1.2rem]',
																align: 'start',
																children: ($$renderer) => {
																	if (Command.Root) {
																		$$renderer.push('<!--[-->');

																		Command.Root($$renderer, {
																			children: ($$renderer) => {
																				if (Command.Input) {
																					$$renderer.push('<!--[-->');
																					Command.Input($$renderer, { placeholder: 'Search pages...' });
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Command.List) {
																					$$renderer.push('<!--[-->');

																					Command.List($$renderer, {
																						children: ($$renderer) => {
																							if (Command.Empty) {
																								$$renderer.push('<!--[-->');

																								Command.Empty($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->No pages found`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` <!--[-->`);

																							const each_array = $.ensure_array_like(Object.entries(grouped()));

																							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																								let [type, items] = each_array[$$index_1];

																								if (Command.Group) {
																									$$renderer.push('<!--[-->');

																									Command.Group($$renderer, {
																										heading: type === "page" ? "Pages" : "Users",
																										children: ($$renderer) => {
																											$$renderer.push(`<!--[-->`);

																											const each_array_1 = $.ensure_array_like(items);

																											for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																												let item = each_array_1[$$index];

																												if (Command.Item) {
																													$$renderer.push('<!--[-->');

																													Command.Item($$renderer, {
																														value: item.title,
																														onSelect: () => {
																															mentions = [...mentions, item];
																															mentionPopoverOpen = false;
																														},

																														children: ($$renderer) => {
																															MentionableIcon($$renderer, { item });
																															$$renderer.push(`<!----> ${$.escape(item.title)}`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
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

											$$renderer.push(` <div class="-m-1.5 no-scrollbar flex gap-1 overflow-y-auto p-1.5"><!--[-->`);

											const each_array_2 = $.ensure_array_like(mentions);

											for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
												let mention = each_array_2[$$index_2];
												const item = SAMPLE_DATA.mentionable.find((item) => item.title === mention);

												if (item) {
													$$renderer.push('<!--[0-->');

													if (InputGroup.Button) {
														$$renderer.push('<!--[-->');

														InputGroup.Button($$renderer, {
															size: 'sm',
															variant: 'secondary',
															class: 'rounded-full !ps-2',
															onclick: () => {
																mentions = mentions.filter((m) => m !== mention);
															},

															children: ($$renderer) => {
																MentionableIcon($$renderer, { item });
																$$renderer.push(`<!----> ${$.escape(item.title)} `);
																XIcon($$renderer, {});
																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
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

								$$renderer.push(` `);

								if (InputGroup.Addon) {
									$$renderer.push('<!--[-->');

									InputGroup.Addon($$renderer, {
										align: 'block-end',
										class: 'gap-1',
										children: ($$renderer) => {
											if (Tooltip.Root) {
												$$renderer.push('<!--[-->');

												Tooltip.Root($$renderer, {
													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																if (InputGroup.Button) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Button($$renderer, $.spread_props([
																		props,
																		{
																			size: 'icon-sm',
																			class: 'rounded-full',
																			'aria-label': 'Attach file',
																			children: ($$renderer) => {
																				PaperclipIcon($$renderer, {});
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

															if (Tooltip.Trigger) {
																$$renderer.push('<!--[-->');
																Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);

														if (Tooltip.Content) {
															$$renderer.push('<!--[-->');

															Tooltip.Content($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Attach file`);
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

											if (DropdownMenu.Root) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Root($$renderer, {
													get open() {
														return modelPopoverOpen;
													},

													set open($$value) {
														modelPopoverOpen = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Tooltip.Root) {
															$$renderer.push('<!--[-->');

															Tooltip.Root($$renderer, {
																children: ($$renderer) => {
																	{
																		function child($$renderer, { props }) {
																			{
																				function child($$renderer, { props }) {
																					if (InputGroup.Button) {
																						$$renderer.push('<!--[-->');

																						InputGroup.Button($$renderer, $.spread_props([
																							props,
																							{
																								size: 'sm',
																								class: 'rounded-full',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(selectedModel.name)}`);
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

																				if (DropdownMenu.Trigger) {
																					$$renderer.push('<!--[-->');
																					DropdownMenu.Trigger($$renderer, $.spread_props([props, { child, $$slots: { child: true } }]));
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}
																		}

																		if (Tooltip.Trigger) {
																			$$renderer.push('<!--[-->');
																			Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	if (Tooltip.Content) {
																		$$renderer.push('<!--[-->');

																		Tooltip.Content($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Select AI model`);
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

														if (DropdownMenu.Content) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Content($$renderer, {
																side: 'top',
																align: 'start',
																class: '[--radius:1rem]',
																children: ($$renderer) => {
																	if (DropdownMenu.Group) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Group($$renderer, {
																			class: 'w-42',
																			children: ($$renderer) => {
																				if (DropdownMenu.Label) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Label($$renderer, {
																						class: 'text-xs text-muted-foreground',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Select Agent Mode`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` <!--[-->`);

																				const each_array_3 = $.ensure_array_like(SAMPLE_DATA.models);

																				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																					let model = each_array_3[$$index_3];

																					if (DropdownMenu.CheckboxItem) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.CheckboxItem($$renderer, {
																							checked: model.name === selectedModel.name,
																							onCheckedChange: (checked) => {
																								if (checked) {
																									selectedModel = model;
																								}
																							},
																							class: 'ps-2 *:[span:first-child]:start-auto *:[span:first-child]:end-2',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(model.name)} `);

																								if (model.badge) {
																									$$renderer.push('<!--[0-->');

																									Badge($$renderer, {
																										variant: 'secondary',
																										class: 'h-5 rounded-sm bg-blue-100 px-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100',
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->${$.escape(model.badge)}`);
																										},
																										$$slots: { default: true }
																									});
																								} else {
																									$$renderer.push('<!--[-1-->');
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

											$$renderer.push(` `);

											if (DropdownMenu.Root) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Root($$renderer, {
													get open() {
														return scopeMenuOpen;
													},

													set open($$value) {
														scopeMenuOpen = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														{
															function child($$renderer, { props }) {
																if (InputGroup.Button) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Button($$renderer, $.spread_props([
																		props,
																		{
																			size: 'sm',
																			class: 'rounded-full',
																			children: ($$renderer) => {
																				GlobeIcon($$renderer, {});
																				$$renderer.push(`<!----> All Sources`);
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
																side: 'top',
																align: 'end',
																class: '[--radius:1rem]',
																children: ($$renderer) => {
																	if (DropdownMenu.Group) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Group($$renderer, {
																			children: ($$renderer) => {
																				{
																					function child($$renderer, { props }) {
																						$$renderer.push(`<label${$.attributes({ for: 'web-search', ...props })}>`);
																						GlobeIcon($$renderer, {});
																						$$renderer.push(`<!----> Web Search `);
																						Switch($$renderer, { id: 'web-search', class: 'ms-auto', checked: true });
																						$$renderer.push(`<!----></label>`);
																					}

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							onSelect: (e) => e.preventDefault(),
																							child,
																							$$slots: { child: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
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
																				{
																					function child($$renderer, { props }) {
																						$$renderer.push(`<label${$.attributes({ for: 'apps', ...props })}>`);
																						AppsIcon($$renderer, {});
																						$$renderer.push(`<!----> Apps and Integrations `);
																						Switch($$renderer, { id: 'apps', class: 'ms-auto', checked: true });
																						$$renderer.push(`<!----></label>`);
																					}

																					if (DropdownMenu.Item) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.Item($$renderer, {
																							onSelect: (e) => e.preventDefault(),
																							child,
																							$$slots: { child: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						children: ($$renderer) => {
																							CirclePlusIcon($$renderer, {});
																							$$renderer.push(`<!----> All Sources I can access`);
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
																									children: ($$renderer) => {
																										Avatar($$renderer, {
																											class: 'size-4',
																											children: ($$renderer) => {
																												AvatarImage($$renderer, { src: 'https://github.com/shadcn.png' });
																												$$renderer.push(`<!----> `);

																												AvatarFallback($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->CN`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push(`<!---->`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push(`<!----> shadcn`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (DropdownMenu.SubContent) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.SubContent($$renderer, {
																									class: 'w-72 p-0 [--radius:1rem]',
																									children: ($$renderer) => {
																										if (Command.Root) {
																											$$renderer.push('<!--[-->');

																											Command.Root($$renderer, {
																												children: ($$renderer) => {
																													if (Command.Input) {
																														$$renderer.push('<!--[-->');
																														Command.Input($$renderer, { placeholder: 'Find or use knowledge in...', autofocus: true });
																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Command.List) {
																														$$renderer.push('<!--[-->');

																														Command.List($$renderer, {
																															children: ($$renderer) => {
																																if (Command.Empty) {
																																	$$renderer.push('<!--[-->');

																																	Command.Empty($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!---->No knowledge found`);
																																		},
																																		$$slots: { default: true }
																																	});

																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}

																																$$renderer.push(` `);

																																if (Command.Group) {
																																	$$renderer.push('<!--[-->');

																																	Command.Group($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!--[-->`);

																																			const each_array_4 = $.ensure_array_like(SAMPLE_DATA.mentionable.filter((item) => item.type === "user"));

																																			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																																				let user = each_array_4[$$index_4];

																																				if (Command.Item) {
																																					$$renderer.push('<!--[-->');

																																					Command.Item($$renderer, {
																																						value: user.title,
																																						onSelect: () => {
																																							// Handle user selection here
																																							console.log("Selected user:", user.title);
																																						},

																																						children: ($$renderer) => {
																																							Avatar($$renderer, {
																																								class: 'size-4',
																																								children: ($$renderer) => {
																																									AvatarImage($$renderer, { src: user.image });
																																									$$renderer.push(`<!----> `);

																																									AvatarFallback($$renderer, {
																																										children: ($$renderer) => {
																																											$$renderer.push(`<!---->${$.escape(user.title[0])}`);
																																										},
																																										$$slots: { default: true }
																																									});

																																									$$renderer.push(`<!---->`);
																																								},
																																								$$slots: { default: true }
																																							});

																																							$$renderer.push(`<!----> ${$.escape(user.title)} <span class="text-muted-foreground">- ${$.escape(user.workspace)}</span>`);
																																						},
																																						$$slots: { default: true }
																																					});

																																					$$renderer.push('<!--]-->');
																																				} else {
																																					$$renderer.push('<!--[!-->');
																																					$$renderer.push('<!--]-->');
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

																				$$renderer.push(` `);

																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						children: ($$renderer) => {
																							BookIcon($$renderer, {});
																							$$renderer.push(`<!----> Help Center`);
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
																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						children: ($$renderer) => {
																							PlusIcon($$renderer, {});
																							$$renderer.push(`<!----> Connect Apps`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (DropdownMenu.Label) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Label($$renderer, {
																						class: 'text-xs text-muted-foreground',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->We'll only search in the sources selected here.`);
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

											if (InputGroup.Button) {
												$$renderer.push('<!--[-->');

												InputGroup.Button($$renderer, {
													'aria-label': 'Send',
													class: 'ms-auto rounded-full',
													variant: 'default',
													size: 'icon-sm',
													children: ($$renderer) => {
														ArrowUpIcon($$renderer, {});
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

		$$renderer.push(`</form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
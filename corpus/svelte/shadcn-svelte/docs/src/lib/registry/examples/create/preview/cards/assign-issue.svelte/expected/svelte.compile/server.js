import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Assign_issue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const users = [
			"shadcn",
			"maxleiter",
			"evilrabbit",
			"pranathip",
			"jorgezreik",
			"shuding",
			"rauchg"
		];

		let open = false;
		let selected = ["shadcn"];

		function toggleUser(username) {
			selected = selected.includes(username)
				? selected.filter((u) => u !== username)
				: [...selected, username];
		}

		function removeUser(e, username) {
			e.stopPropagation();
			selected = selected.filter((u) => u !== username);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'w-full max-w-sm',
					size: 'sm',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								class: 'border-b',
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											class: 'text-sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Assign Issue`);
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
											class: 'text-sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select users to assign to this issue.`);
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
												if (Tooltip.Root) {
													$$renderer.push('<!--[-->');

													Tooltip.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	Button($$renderer, $.spread_props([
																		{ variant: 'outline', size: 'icon-xs' },
																		props,
																		{
																			children: ($$renderer) => {
																				IconPlaceholder($$renderer, {
																					lucide: 'PlusIcon',
																					tabler: 'IconPlus',
																					hugeicons: 'PlusSignIcon',
																					phosphor: 'PlusIcon',
																					remixicon: 'RiAddLine'
																				});
																			},
																			$$slots: { default: true }
																		}
																	]));
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
																		$$renderer.push(`<!---->Add user`);
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
									if (Popover.Root) {
										$$renderer.push('<!--[-->');

										Popover.Root($$renderer, {
											get open() {
												return open;
											},

											set open($$value) {
												open = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														$$renderer.push(`<div${$.attributes({
															...props,
															role: 'combobox',
															'aria-expanded': open,
															class: 'flex min-h-9 min-w-0 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-offset-2'
														})}><!--[-->`);

														const each_array = $.ensure_array_like(selected);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let username = each_array[$$index];

															Badge($$renderer, {
																variant: 'secondary',
																class: 'gap-1 pr-0.5',
																onclick: (e) => removeUser(e, username),
																onkeydown: (e) => e.key === "Enter" && removeUser(e, username),
																children: ($$renderer) => {
																	if (Avatar.Root) {
																		$$renderer.push('<!--[-->');

																		Avatar.Root($$renderer, {
																			class: 'size-4',
																			children: ($$renderer) => {
																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');

																					Avatar.Image($$renderer, {
																						src: `https://github.com/${$.stringify(username)}.png`,
																						alt: username
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Avatar.Fallback) {
																					$$renderer.push('<!--[-->');

																					Avatar.Fallback($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(username.charAt(0))}`);
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

																	$$renderer.push(` ${$.escape(username)} `);

																	IconPlaceholder($$renderer, {
																		lucide: 'XIcon',
																		tabler: 'IconX',
																		hugeicons: 'Cancel01Icon',
																		phosphor: 'XIcon',
																		remixicon: 'RiCloseLine',
																		class: 'size-3'
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});
														}

														$$renderer.push(`<!--]--> <span class="flex-1 py-1 text-sm text-muted-foreground">${$.escape(selected.length > 0 ? "Select users..." : "Select a user...")}</span></div>`);
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
														class: 'w-(--bits-popover-trigger-width) p-0',
														align: 'start',
														children: ($$renderer) => {
															if (Command.Root) {
																$$renderer.push('<!--[-->');

																Command.Root($$renderer, {
																	children: ($$renderer) => {
																		if (Command.Input) {
																			$$renderer.push('<!--[-->');
																			Command.Input($$renderer, { placeholder: 'Search users...' });
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
																								$$renderer.push(`<!---->No users found.`);
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
																							value: 'users',
																							children: ($$renderer) => {
																								$$renderer.push(`<!--[-->`);

																								const each_array_1 = $.ensure_array_like(users);

																								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																									let username = each_array_1[$$index_1];

																									if (Command.Item) {
																										$$renderer.push('<!--[-->');

																										Command.Item($$renderer, {
																											value: username,
																											onSelect: () => toggleUser(username),
																											children: ($$renderer) => {
																												IconPlaceholder($$renderer, {
																													lucide: 'CheckIcon',
																													tabler: 'IconCheck',
																													hugeicons: 'Tick02Icon',
																													phosphor: 'CheckIcon',
																													remixicon: 'RiCheckLine',
																													class: cn(!selected.includes(username) && "text-transparent")
																												});

																												$$renderer.push(`<!----> `);

																												if (Avatar.Root) {
																													$$renderer.push('<!--[-->');

																													Avatar.Root($$renderer, {
																														class: 'size-5',
																														children: ($$renderer) => {
																															if (Avatar.Image) {
																																$$renderer.push('<!--[-->');

																																Avatar.Image($$renderer, {
																																	src: `https://github.com/${$.stringify(username)}.png`,
																																	alt: username
																																});

																																$$renderer.push('<!--]-->');
																															} else {
																																$$renderer.push('<!--[!-->');
																																$$renderer.push('<!--]-->');
																															}

																															$$renderer.push(` `);

																															if (Avatar.Fallback) {
																																$$renderer.push('<!--[-->');

																																Avatar.Fallback($$renderer, {
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(username.charAt(0))}`);
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

																												$$renderer.push(` ${$.escape(username)}`);
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
	});
}
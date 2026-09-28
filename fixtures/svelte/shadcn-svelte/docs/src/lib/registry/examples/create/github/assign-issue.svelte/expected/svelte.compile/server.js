import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Assign_issue($$renderer) {
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
	let selectedUsers = [users[0]];

	function toggleUser(username) {
		if (selectedUsers.includes(username)) {
			selectedUsers = selectedUsers.filter((u) => u !== username);
		} else {
			selectedUsers = [...selectedUsers, username];
		}
	}

	function removeUser(username, event) {
		event.stopPropagation();
		selectedUsers = selectedUsers.filter((u) => u !== username);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'User Select',
			class: 'items-center justify-center',
			children: ($$renderer) => {
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
																class: 'flex min-h-7 cursor-pointer flex-wrap items-center gap-1 rounded-md border border-input bg-input/20 bg-clip-padding px-1 py-0.5 text-xs/relaxed transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 dark:bg-input/30',
																role: 'button'
															})}><!--[-->`);

															const each_array = $.ensure_array_like(selectedUsers);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let username = each_array[$$index];

																$$renderer.push(`<div class="flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] bg-muted-foreground/10 px-1.5 text-xs/relaxed font-medium whitespace-nowrap text-foreground">`);

																if (Avatar.Root) {
																	$$renderer.push('<!--[-->');

																	Avatar.Root($$renderer, {
																		class: 'size-4',
																		children: ($$renderer) => {
																			if (Avatar.Image) {
																				$$renderer.push('<!--[-->');
																				Avatar.Image($$renderer, { src: `https://github.com/${username}.png`, alt: username });
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

																$$renderer.push(` ${$.escape(username)} <button type="button" class="-ml-1 opacity-50 hover:opacity-100"${$.attr('aria-label', `Remove ${username}`)}>`);

																IconPlaceholder($$renderer, {
																	lucide: 'XIcon',
																	tabler: 'IconX',
																	hugeicons: 'Cancel01Icon',
																	phosphor: 'XIcon',
																	remixicon: 'RiCloseLine',
																	class: 'size-3'
																});

																$$renderer.push(`<!----></button></div>`);
															}

															$$renderer.push(`<!--]--> <input type="text"${$.attr('placeholder', selectedUsers.length > 0 ? undefined : "Select a item...")} class="min-w-[120px] flex-1 border-none bg-transparent outline-none"/></div>`);
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
															class: 'w-[var(--bits-popover-trigger-width)] p-0',
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
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array_1 = $.ensure_array_like(users);

																									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																										let username = each_array_1[$$index_1];

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												value: username,
																												onSelect: () => {
																													toggleUser(username);
																												},
																												'data-checked': selectedUsers.includes(username),
																												children: ($$renderer) => {
																													if (Avatar.Root) {
																														$$renderer.push('<!--[-->');

																														Avatar.Root($$renderer, {
																															class: 'size-5',
																															children: ($$renderer) => {
																																if (Avatar.Image) {
																																	$$renderer.push('<!--[-->');
																																	Avatar.Image($$renderer, { src: `https://github.com/${username}.png`, alt: username });
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
}
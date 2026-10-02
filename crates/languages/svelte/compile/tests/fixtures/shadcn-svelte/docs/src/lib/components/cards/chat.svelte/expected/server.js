import * as $ from 'svelte/internal/server';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import CheckIcon from "@lucide/svelte/icons/check";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Chat($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const users = [
			{
				name: "Olivia Martin",
				email: "m@example.com",
				avatar: "/avatars/01.png"
			},

			{
				name: "Isabella Nguyen",
				email: "isabella.nguyen@email.com",
				avatar: "/avatars/03.png"
			},

			{
				name: "Emma Wilson",
				email: "emma@example.com",
				avatar: "/avatars/05.png"
			},

			{
				name: "Jackson Lee",
				email: "lee@example.com",
				avatar: "/avatars/02.png"
			},

			{
				name: "William Kim",
				email: "will@email.com",
				avatar: "/avatars/04.png"
			}
		];

		let open = false;
		let selectedUsers = [];

		let messages = [
			{ role: "agent", content: "Hi, how can I help you today?" },
			{
				role: "user",
				content: "Hey, I'm having trouble with my account."
			},
			{ role: "agent", content: "What seems to be the problem?" },
			{ role: "user", content: "I can't log in." }
		];

		let input = "";
		let inputLength = $.derived(() => input.trim().length);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								class: 'flex flex-row items-center',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-4">`);

									if (Avatar.Root) {
										$$renderer.push('<!--[-->');

										Avatar.Root($$renderer, {
											class: 'border',
											children: ($$renderer) => {
												if (Avatar.Image) {
													$$renderer.push('<!--[-->');
													Avatar.Image($$renderer, { src: '/avatars/01.png', alt: 'Image' });
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
															$$renderer.push(`<!---->OM`);
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

									$$renderer.push(` <div class="flex flex-col gap-0.5"><p class="text-sm leading-none font-medium">Sofia Davis</p> <p class="text-xs text-muted-foreground">m@example.com</p></div></div> `);

									if (Tooltip.Provider) {
										$$renderer.push('<!--[-->');

										Tooltip.Provider($$renderer, {
											delayDuration: 0,
											children: ($$renderer) => {
												if (Tooltip.Root) {
													$$renderer.push('<!--[-->');

													Tooltip.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	Button($$renderer, $.spread_props([
																		props,
																		{
																			size: 'icon',
																			variant: 'secondary',
																			class: 'ms-auto size-8 rounded-full',
																			onclick: () => open = true,
																			children: ($$renderer) => {
																				PlusIcon($$renderer, {});
																				$$renderer.push(`<!----> <span class="sr-only">New message</span>`);
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
																	sideOffset: 10,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->New message`);
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
									$$renderer.push(`<div class="flex flex-col gap-4"><!--[-->`);

									const each_array = $.ensure_array_like(messages);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let message = each_array[index];

										$$renderer.push(`<div${$.attr_class($.clsx(cn("flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm", message.role === "user"
											? "ms-auto bg-primary text-primary-foreground"
											: "bg-muted")))}>${$.escape(message.content)}</div>`);
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<form class="relative w-full">`);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');

													InputGroup.Input($$renderer, {
														id: 'message',
														placeholder: 'Type your message...',
														autocomplete: 'off',
														get value() {
															return input;
														},

														set value($$value) {
															input = $$value;
															$$settled = false;
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
														align: 'inline-end',
														children: ($$renderer) => {
															if (InputGroup.Button) {
																$$renderer.push('<!--[-->');

																InputGroup.Button($$renderer, {
																	type: 'submit',
																	size: 'icon-xs',
																	class: 'rounded-full',
																	children: ($$renderer) => {
																		ArrowUpIcon($$renderer, {});
																		$$renderer.push(`<!----> <span class="sr-only">Send</span>`);
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

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'gap-0 p-0 outline-none',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											class: 'px-4 pt-5 pb-4',
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->New message`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Invite a user to this thread. This will create a new group message.`);
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

									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											class: 'overflow-hidden rounded-t-none border-t bg-transparent',
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search user...' });
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
																	class: 'p-2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_1 = $.ensure_array_like(users);

																		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																			let user = each_array_1[$$index_1];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					class: 'data-[active=true]:opacity-50',
																					onSelect: () => {
																						if (selectedUsers.includes(user)) {
																							selectedUsers = selectedUsers.filter((u) => u.email !== user.email);
																						} else {
																							selectedUsers = [...users].filter((u) => [...selectedUsers, user].includes(u));
																						}
																					},

																					children: ($$renderer) => {
																						if (Avatar.Root) {
																							$$renderer.push('<!--[-->');

																							Avatar.Root($$renderer, {
																								class: 'border',
																								children: ($$renderer) => {
																									if (Avatar.Image) {
																										$$renderer.push('<!--[-->');
																										Avatar.Image($$renderer, { src: user.avatar, alt: 'Image' });
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
																												$$renderer.push(`<!---->${$.escape(user.name[0])}`);
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

																						$$renderer.push(` <div class="ms-2"><p class="text-sm leading-none font-medium">${$.escape(user.name)}</p> <p class="text-sm text-muted-foreground">${$.escape(user.email)}</p></div> `);

																						if (selectedUsers.includes(user)) {
																							$$renderer.push('<!--[0-->');
																							CheckIcon($$renderer, { class: 'ms-auto flex size-4 text-primary' });
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

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											class: 'flex items-center border-t p-4 sm:justify-between',
											children: ($$renderer) => {
												if (selectedUsers.length > 0) {
													$$renderer.push(`<!--[0--><div class="flex -space-x-2 overflow-hidden"><!--[-->`);

													const each_array_2 = $.ensure_array_like(selectedUsers);

													for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
														let user = each_array_2[$$index_2];

														if (Avatar.Root) {
															$$renderer.push('<!--[-->');

															Avatar.Root($$renderer, {
																class: 'inline-block border',
																children: ($$renderer) => {
																	if (Avatar.Image) {
																		$$renderer.push('<!--[-->');
																		Avatar.Image($$renderer, { src: user.avatar });
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
																				$$renderer.push(`<!---->${$.escape(user.name[0])}`);
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

													$$renderer.push(`<!--]--></div>`);
												} else {
													$$renderer.push(`<!--[-1--><p class="text-sm text-muted-foreground">Select users to add to this thread.</p>`);
												}

												$$renderer.push(`<!--]--> `);

												Button($$renderer, {
													disabled: selectedUsers.length < 2,
													onclick: () => open = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Continue`);
													},
													$$slots: { default: true }
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
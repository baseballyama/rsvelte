import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Team_members($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let members = [
			{
				name: "Sofia Davis",
				email: "m@example.com",
				role: "Owner",
				avatar: "/avatars/01.png"
			},

			{
				name: "Jackson Lee",
				email: "p@example.com",
				role: "Developer",
				avatar: "/avatars/02.png"
			},

			{
				name: "Isabella Nguyen",
				email: "i@example.com",
				role: "Billing",
				avatar: "/avatars/03.png"
			}
		];

		const roles = [
			{ name: "Viewer", description: "Can view and comment." },
			{
				name: "Developer",
				description: "Can view, comment and edit."
			},

			{
				name: "Billing",
				description: "Can view, comment and manage billing."
			},

			{
				name: "Owner",
				description: "Admin-level access to all resources."
			}
		];

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'gap-4',
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Team Members`);
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
											$$renderer.push(`<!---->Invite your team members to collaborate.`);
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
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(members);

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let member = each_array[$$index_1];

									if (Item.Item) {
										$$renderer.push('<!--[-->');

										Item.Item($$renderer, {
											size: 'sm',
											class: 'gap-4 px-0',
											children: ($$renderer) => {
												if (Avatar.Root) {
													$$renderer.push('<!--[-->');

													Avatar.Root($$renderer, {
														class: 'shrink-0 self-start border',
														children: ($$renderer) => {
															if (Avatar.Image) {
																$$renderer.push('<!--[-->');
																Avatar.Image($$renderer, { src: member.avatar, alt: 'Image' });
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
																		$$renderer.push(`<!---->${$.escape(member.name.split(" ").map((n) => n[0]).join(""))}`);
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

												if (Item.Content) {
													$$renderer.push('<!--[-->');

													Item.Content($$renderer, {
														children: ($$renderer) => {
															if (Item.Title) {
																$$renderer.push('<!--[-->');

																Item.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(member.name)}`);
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
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(member.email)}`);
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

												if (Item.Actions) {
													$$renderer.push('<!--[-->');

													Item.Actions($$renderer, {
														children: ($$renderer) => {
															if (Popover.Root) {
																$$renderer.push('<!--[-->');

																Popover.Root($$renderer, {
																	children: ($$renderer) => {
																		if (Popover.Trigger) {
																			$$renderer.push('<!--[-->');

																			Popover.Trigger($$renderer, {
																				class: buttonVariants({ variant: "outline", size: "sm", class: "ms-auto shadow-none" }),
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(member.role)} `);
																					ChevronDownIcon($$renderer, {});
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

																		if (Popover.Content) {
																			$$renderer.push('<!--[-->');

																			Popover.Content($$renderer, {
																				class: 'p-0',
																				align: 'end',
																				children: ($$renderer) => {
																					if (Command.Root) {
																						$$renderer.push('<!--[-->');

																						Command.Root($$renderer, {
																							children: ($$renderer) => {
																								if (Command.Input) {
																									$$renderer.push('<!--[-->');
																									Command.Input($$renderer, { placeholder: 'Select role...' });
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
																														$$renderer.push(`<!---->No roles found.`);
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

																														const each_array_1 = $.ensure_array_like(roles);

																														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																															let role = each_array_1[$$index];

																															if (Command.Item) {
																																$$renderer.push('<!--[-->');

																																Command.Item($$renderer, {
																																	onSelect: () => member.role = role.name,
																																	children: ($$renderer) => {
																																		$$renderer.push(`<div class="flex flex-col"><p class="text-sm font-medium">${$.escape(role.name)}</p> <p class="text-muted-foreground">${$.escape(role.description)}</p></div>`);
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
	});
}
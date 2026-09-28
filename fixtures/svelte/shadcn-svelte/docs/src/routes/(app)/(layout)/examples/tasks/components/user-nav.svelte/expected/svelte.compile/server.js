import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import Button from "$lib/registry/ui/button/button.svelte";

export default function User_nav($$renderer) {
	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							props,
							{
								variant: 'ghost',
								class: 'relative size-8 rounded-full',
								children: ($$renderer) => {
									if (Avatar.Root) {
										$$renderer.push('<!--[-->');

										Avatar.Root($$renderer, {
											class: 'size-9',
											children: ($$renderer) => {
												if (Avatar.Image) {
													$$renderer.push('<!--[-->');
													Avatar.Image($$renderer, { src: '/avatars/01.png', alt: '@shadcn' });
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
															$$renderer.push(`<!---->SC`);
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
						class: 'w-56',
						align: 'end',
						children: ($$renderer) => {
							if (DropdownMenu.Group) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Group($$renderer, {
									children: ($$renderer) => {
										if (DropdownMenu.Label) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Label($$renderer, {
												class: 'font-normal',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex flex-col space-y-1"><p class="text-sm leading-none font-medium">shadcn</p> <p class="text-xs leading-none text-muted-foreground">m@example.com</p></div>`);
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
																$$renderer.push(`<!---->Profile `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⇧⌘P`);
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
																$$renderer.push(`<!---->Billing `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘B`);
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
																$$renderer.push(`<!---->Settings `);

																if (DropdownMenu.Shortcut) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Shortcut($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->⌘S`);
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
																$$renderer.push(`<!---->New Team`);
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

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Log out `);

													if (DropdownMenu.Shortcut) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⇧⌘Q`);
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
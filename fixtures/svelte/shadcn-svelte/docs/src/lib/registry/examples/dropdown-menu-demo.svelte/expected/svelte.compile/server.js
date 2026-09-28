import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Dropdown_menu_demo($$renderer) {
	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							props,
							{
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Open`);
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
						align: 'start',
						children: ($$renderer) => {
							if (DropdownMenu.Label) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->My Account`);
									},
									$$slots: { default: true }
								});

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
													$$renderer.push(`<!---->Keyboard shortcuts `);

													if (DropdownMenu.Shortcut) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘K`);
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
										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Team`);
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
																$$renderer.push(`<!---->Invite users`);
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
															children: ($$renderer) => {
																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Email`);
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
																			$$renderer.push(`<!---->Message`);
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
																			$$renderer.push(`<!---->More...`);
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
													$$renderer.push(`<!---->New Team `);

													if (DropdownMenu.Shortcut) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘+T`);
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

							if (DropdownMenu.Item) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Item($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->GitHub`);
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
										$$renderer.push(`<!---->Support`);
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
									disabled: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->API`);
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
}
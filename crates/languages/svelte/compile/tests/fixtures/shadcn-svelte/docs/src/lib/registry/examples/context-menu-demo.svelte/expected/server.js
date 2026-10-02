import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";

export default function Context_menu_demo($$renderer) {
	let showBookmarks = false;
	let showFullURLs = true;
	let value = "pedro";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (ContextMenu.Root) {
			$$renderer.push('<!--[-->');

			ContextMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (ContextMenu.Trigger) {
						$$renderer.push('<!--[-->');

						ContextMenu.Trigger($$renderer, {
							class: 'flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Right click here`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ContextMenu.Content) {
						$$renderer.push('<!--[-->');

						ContextMenu.Content($$renderer, {
							class: 'w-52',
							children: ($$renderer) => {
								if (ContextMenu.Item) {
									$$renderer.push('<!--[-->');

									ContextMenu.Item($$renderer, {
										inset: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Back `);

											if (ContextMenu.Shortcut) {
												$$renderer.push('<!--[-->');

												ContextMenu.Shortcut($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->⌘[`);
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

								if (ContextMenu.Item) {
									$$renderer.push('<!--[-->');

									ContextMenu.Item($$renderer, {
										inset: true,
										disabled: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Forward `);

											if (ContextMenu.Shortcut) {
												$$renderer.push('<!--[-->');

												ContextMenu.Shortcut($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->⌘]`);
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

								if (ContextMenu.Item) {
									$$renderer.push('<!--[-->');

									ContextMenu.Item($$renderer, {
										inset: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Reload `);

											if (ContextMenu.Shortcut) {
												$$renderer.push('<!--[-->');

												ContextMenu.Shortcut($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->⌘R`);
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

								if (ContextMenu.Sub) {
									$$renderer.push('<!--[-->');

									ContextMenu.Sub($$renderer, {
										children: ($$renderer) => {
											if (ContextMenu.SubTrigger) {
												$$renderer.push('<!--[-->');

												ContextMenu.SubTrigger($$renderer, {
													inset: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->More Tools`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ContextMenu.SubContent) {
												$$renderer.push('<!--[-->');

												ContextMenu.SubContent($$renderer, {
													class: 'w-48',
													children: ($$renderer) => {
														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Save Page As... `);

																	if (ContextMenu.Shortcut) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.Shortcut($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->⇧⌘S`);
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

														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Create Shortcut...`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Name Window...`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.Separator) {
															$$renderer.push('<!--[-->');
															ContextMenu.Separator($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Developer Tools`);
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

								if (ContextMenu.Separator) {
									$$renderer.push('<!--[-->');
									ContextMenu.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (ContextMenu.CheckboxItem) {
									$$renderer.push('<!--[-->');

									ContextMenu.CheckboxItem($$renderer, {
										get checked() {
											return showBookmarks;
										},

										set checked($$value) {
											showBookmarks = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Show Bookmarks`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (ContextMenu.CheckboxItem) {
									$$renderer.push('<!--[-->');

									ContextMenu.CheckboxItem($$renderer, {
										get checked() {
											return showFullURLs;
										},

										set checked($$value) {
											showFullURLs = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Show Full URLs`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (ContextMenu.Separator) {
									$$renderer.push('<!--[-->');
									ContextMenu.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (ContextMenu.RadioGroup) {
									$$renderer.push('<!--[-->');

									ContextMenu.RadioGroup($$renderer, {
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (ContextMenu.Group) {
												$$renderer.push('<!--[-->');

												ContextMenu.Group($$renderer, {
													children: ($$renderer) => {
														if (ContextMenu.GroupHeading) {
															$$renderer.push('<!--[-->');

															ContextMenu.GroupHeading($$renderer, {
																inset: true,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->People`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.RadioItem) {
															$$renderer.push('<!--[-->');

															ContextMenu.RadioItem($$renderer, {
																value: 'pedro',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Pedro Duarte`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.RadioItem) {
															$$renderer.push('<!--[-->');

															ContextMenu.RadioItem($$renderer, {
																value: 'colm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Colm Tuite`);
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
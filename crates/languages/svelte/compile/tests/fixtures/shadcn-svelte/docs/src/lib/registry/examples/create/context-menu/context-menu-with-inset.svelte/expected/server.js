import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_inset($$renderer) {
	let showBookmarks = true;
	let showUrls = false;
	let theme = "system";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Inset',
			children: ($$renderer) => {
				if (ContextMenu.Root) {
					$$renderer.push('<!--[-->');

					ContextMenu.Root($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Trigger) {
								$$renderer.push('<!--[-->');

								ContextMenu.Trigger($$renderer, {
									class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
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
									class: 'w-44',
									children: ($$renderer) => {
										if (ContextMenu.Group) {
											$$renderer.push('<!--[-->');

											ContextMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Label) {
														$$renderer.push('<!--[-->');

														ContextMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Actions`);
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
																IconPlaceholder($$renderer, {
																	lucide: 'CopyIcon',
																	tabler: 'IconCopy',
																	hugeicons: 'CopyIcon',
																	phosphor: 'CopyIcon',
																	remixicon: 'RiFileCopyLine'
																});

																$$renderer.push(`<!----> Copy`);
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
																IconPlaceholder($$renderer, {
																	lucide: 'ScissorsIcon',
																	tabler: 'IconCut',
																	hugeicons: 'ScissorIcon',
																	phosphor: 'ScissorsIcon',
																	remixicon: 'RiScissorsLine'
																});

																$$renderer.push(`<!----> Cut`);
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
																$$renderer.push(`<!---->Paste`);
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

										if (ContextMenu.Group) {
											$$renderer.push('<!--[-->');

											ContextMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Label) {
														$$renderer.push('<!--[-->');

														ContextMenu.Label($$renderer, {
															inset: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Appearance`);
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
															inset: true,
															get checked() {
																return showBookmarks;
															},

															set checked($$value) {
																showBookmarks = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																$$renderer.push(`<!---->Bookmarks`);
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
															inset: true,
															get checked() {
																return showUrls;
															},

															set checked($$value) {
																showUrls = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																$$renderer.push(`<!---->Full URLs`);
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

										if (ContextMenu.Group) {
											$$renderer.push('<!--[-->');

											ContextMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Label) {
														$$renderer.push('<!--[-->');

														ContextMenu.Label($$renderer, {
															inset: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Theme`);
															},
															$$slots: { default: true }
														});

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
																return theme;
															},

															set value($$value) {
																theme = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
																		inset: true,
																		value: 'light',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Light`);
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
																		inset: true,
																		value: 'dark',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Dark`);
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
																		inset: true,
																		value: 'system',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->System`);
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

										if (ContextMenu.Sub) {
											$$renderer.push('<!--[-->');

											ContextMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														ContextMenu.SubTrigger($$renderer, {
															inset: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->More Options`);
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
															children: ($$renderer) => {
																if (ContextMenu.Group) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Group($$renderer, {
																		children: ($$renderer) => {
																			if (ContextMenu.Item) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.Item($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Save Page...`);
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
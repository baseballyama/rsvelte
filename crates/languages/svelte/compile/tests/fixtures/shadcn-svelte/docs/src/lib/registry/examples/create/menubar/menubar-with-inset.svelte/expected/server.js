import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_with_inset($$renderer) {
	let showBookmarks = true;
	let showUrls = false;
	let theme = "system";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Inset',
			children: ($$renderer) => {
				if (Menubar.Root) {
					$$renderer.push('<!--[-->');

					Menubar.Root($$renderer, {
						children: ($$renderer) => {
							if (Menubar.Menu) {
								$$renderer.push('<!--[-->');

								Menubar.Menu($$renderer, {
									children: ($$renderer) => {
										if (Menubar.Trigger) {
											$$renderer.push('<!--[-->');

											Menubar.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->View`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menubar.Content) {
											$$renderer.push('<!--[-->');

											Menubar.Content($$renderer, {
												class: 'w-44',
												children: ($$renderer) => {
													if (Menubar.Group) {
														$$renderer.push('<!--[-->');

														Menubar.Group($$renderer, {
															children: ($$renderer) => {
																if (Menubar.Label) {
																	$$renderer.push('<!--[-->');

																	Menubar.Label($$renderer, {
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

																if (Menubar.Item) {
																	$$renderer.push('<!--[-->');

																	Menubar.Item($$renderer, {
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

																if (Menubar.Item) {
																	$$renderer.push('<!--[-->');

																	Menubar.Item($$renderer, {
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

																if (Menubar.Item) {
																	$$renderer.push('<!--[-->');

																	Menubar.Item($$renderer, {
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

													if (Menubar.Separator) {
														$$renderer.push('<!--[-->');
														Menubar.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Menubar.Group) {
														$$renderer.push('<!--[-->');

														Menubar.Group($$renderer, {
															children: ($$renderer) => {
																if (Menubar.Label) {
																	$$renderer.push('<!--[-->');

																	Menubar.Label($$renderer, {
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

																if (Menubar.CheckboxItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.CheckboxItem($$renderer, {
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

																if (Menubar.CheckboxItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.CheckboxItem($$renderer, {
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

													if (Menubar.Separator) {
														$$renderer.push('<!--[-->');
														Menubar.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Menubar.Group) {
														$$renderer.push('<!--[-->');

														Menubar.Group($$renderer, {
															children: ($$renderer) => {
																if (Menubar.Label) {
																	$$renderer.push('<!--[-->');

																	Menubar.Label($$renderer, {
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

																if (Menubar.RadioGroup) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioGroup($$renderer, {
																		get value() {
																			return theme;
																		},

																		set value($$value) {
																			theme = $$value;
																			$$settled = false;
																		},

																		children: ($$renderer) => {
																			if (Menubar.RadioItem) {
																				$$renderer.push('<!--[-->');

																				Menubar.RadioItem($$renderer, {
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

																			if (Menubar.RadioItem) {
																				$$renderer.push('<!--[-->');

																				Menubar.RadioItem($$renderer, {
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

																			if (Menubar.RadioItem) {
																				$$renderer.push('<!--[-->');

																				Menubar.RadioItem($$renderer, {
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

													if (Menubar.Separator) {
														$$renderer.push('<!--[-->');
														Menubar.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Menubar.Sub) {
														$$renderer.push('<!--[-->');

														Menubar.Sub($$renderer, {
															children: ($$renderer) => {
																if (Menubar.SubTrigger) {
																	$$renderer.push('<!--[-->');

																	Menubar.SubTrigger($$renderer, {
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

																if (Menubar.SubContent) {
																	$$renderer.push('<!--[-->');

																	Menubar.SubContent($$renderer, {
																		children: ($$renderer) => {
																			if (Menubar.Group) {
																				$$renderer.push('<!--[-->');

																				Menubar.Group($$renderer, {
																					children: ($$renderer) => {
																						if (Menubar.Item) {
																							$$renderer.push('<!--[-->');

																							Menubar.Item($$renderer, {
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

																						if (Menubar.Item) {
																							$$renderer.push('<!--[-->');

																							Menubar.Item($$renderer, {
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
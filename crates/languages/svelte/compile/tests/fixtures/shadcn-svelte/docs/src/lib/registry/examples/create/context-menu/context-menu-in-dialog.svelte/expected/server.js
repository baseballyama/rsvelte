import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_in_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'In Dialog',
				children: ($$renderer) => {
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
								if (Dialog.Trigger) {
									$$renderer.push('<!--[-->');

									Dialog.Trigger($$renderer, {
										class: buttonVariants({ variant: "outline" }),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open Dialog`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Header) {
												$$renderer.push('<!--[-->');

												Dialog.Header($$renderer, {
													children: ($$renderer) => {
														if (Dialog.Title) {
															$$renderer.push('<!--[-->');

															Dialog.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Context Menu Example`);
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
																	$$renderer.push(`<!---->Right click on the area below to see the context menu.`);
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
																children: ($$renderer) => {
																	if (ContextMenu.Group) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.Group($$renderer, {
																			children: ($$renderer) => {
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
																						children: ($$renderer) => {
																							IconPlaceholder($$renderer, {
																								lucide: 'ClipboardPasteIcon',
																								tabler: 'IconClipboard',
																								hugeicons: 'ClipboardIcon',
																								phosphor: 'ClipboardIcon',
																								remixicon: 'RiClipboardLine'
																							});

																							$$renderer.push(`<!----> Paste`);
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
																				if (ContextMenu.Item) {
																					$$renderer.push('<!--[-->');

																					ContextMenu.Item($$renderer, {
																						variant: 'destructive',
																						children: ($$renderer) => {
																							IconPlaceholder($$renderer, {
																								lucide: 'TrashIcon',
																								tabler: 'IconTrash',
																								hugeicons: 'DeleteIcon',
																								phosphor: 'TrashIcon',
																								remixicon: 'RiDeleteBinLine'
																							});

																							$$renderer.push(`<!----> Delete`);
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
	});
}
import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_in_dialog($$renderer) {
	Example($$renderer, {
		title: 'In Dialog',
		children: ($$renderer) => {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open Dialog`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');
								Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
															$$renderer.push(`<!---->Menubar Example`);
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
															$$renderer.push(`<!---->Use the menubar below to see the menu options.`);
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
																		$$renderer.push(`<!---->File`);
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
																	children: ($$renderer) => {
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

																								$$renderer.push(` `);

																								if (Menubar.Item) {
																									$$renderer.push('<!--[-->');

																									Menubar.Item($$renderer, {
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

																								if (Menubar.Separator) {
																									$$renderer.push('<!--[-->');
																									Menubar.Separator($$renderer, {});
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

																		if (Menubar.Separator) {
																			$$renderer.push('<!--[-->');
																			Menubar.Separator($$renderer, {});
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Menubar.Item) {
																			$$renderer.push('<!--[-->');

																			Menubar.Item($$renderer, {
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

												$$renderer.push(` `);

												if (Menubar.Menu) {
													$$renderer.push('<!--[-->');

													Menubar.Menu($$renderer, {
														children: ($$renderer) => {
															if (Menubar.Trigger) {
																$$renderer.push('<!--[-->');

																Menubar.Trigger($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Edit`);
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
																	children: ($$renderer) => {
																		if (Menubar.Item) {
																			$$renderer.push('<!--[-->');

																			Menubar.Item($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Undo `);

																					if (Menubar.Shortcut) {
																						$$renderer.push('<!--[-->');

																						Menubar.Shortcut($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->⌘Z`);
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

																		if (Menubar.Item) {
																			$$renderer.push('<!--[-->');

																			Menubar.Item($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Redo `);

																					if (Menubar.Shortcut) {
																						$$renderer.push('<!--[-->');

																						Menubar.Shortcut($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->⇧⌘Z`);
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
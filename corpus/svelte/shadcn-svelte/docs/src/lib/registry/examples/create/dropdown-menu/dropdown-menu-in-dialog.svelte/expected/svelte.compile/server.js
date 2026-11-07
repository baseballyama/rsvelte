import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_in_dialog($$renderer) {
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
															$$renderer.push(`<!---->Dropdown Menu Example`);
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
															$$renderer.push(`<!---->Click the button below to see the dropdown menu.`);
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

									if (DropdownMenu.Root) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Root($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline', class: 'w-fit' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Open Menu`);
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
														children: ($$renderer) => {
															if (DropdownMenu.Item) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Item($$renderer, {
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

															if (DropdownMenu.Item) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Item($$renderer, {
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

															if (DropdownMenu.Item) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Item($$renderer, {
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

															if (DropdownMenu.Separator) {
																$$renderer.push('<!--[-->');
																DropdownMenu.Separator($$renderer, {});
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

																		if (DropdownMenu.Portal) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Portal($$renderer, {
																				children: ($$renderer) => {
																					if (DropdownMenu.SubContent) {
																						$$renderer.push('<!--[-->');

																						DropdownMenu.SubContent($$renderer, {
																							children: ($$renderer) => {
																								if (DropdownMenu.Item) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Item($$renderer, {
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

																								if (DropdownMenu.Item) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Item($$renderer, {
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

																								if (DropdownMenu.Item) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Item($$renderer, {
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
}
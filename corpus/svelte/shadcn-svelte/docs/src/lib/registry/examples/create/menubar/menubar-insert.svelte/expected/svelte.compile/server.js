import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_insert($$renderer) {
	Example($$renderer, {
		title: 'Insert',
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
												$$renderer.push(`<!---->Insert`);
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
												if (Menubar.Sub) {
													$$renderer.push('<!--[-->');

													Menubar.Sub($$renderer, {
														children: ($$renderer) => {
															if (Menubar.SubTrigger) {
																$$renderer.push('<!--[-->');

																Menubar.SubTrigger($$renderer, {
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'ImageIcon',
																			tabler: 'IconPhoto',
																			hugeicons: 'ImageIcon',
																			phosphor: 'ImageIcon',
																			remixicon: 'RiImageLine'
																		});

																		$$renderer.push(`<!----> Media`);
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
																					$$renderer.push(`<!---->Image`);
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
																					$$renderer.push(`<!---->Video`);
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
																					$$renderer.push(`<!---->Audio`);
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
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'LinkIcon',
																tabler: 'IconLink',
																hugeicons: 'LinkIcon',
																phosphor: 'LinkIcon',
																remixicon: 'RiLinksLine'
															});

															$$renderer.push(`<!----> Link `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
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

												$$renderer.push(` `);

												if (Menubar.Item) {
													$$renderer.push('<!--[-->');

													Menubar.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'TableIcon',
																tabler: 'IconTable',
																hugeicons: 'TableIcon',
																phosphor: 'TableIcon',
																remixicon: 'RiTableLine'
															});

															$$renderer.push(`<!----> Table`);
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
												$$renderer.push(`<!---->Tools`);
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
												if (Menubar.Item) {
													$$renderer.push('<!--[-->');

													Menubar.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'SearchIcon',
																tabler: 'IconSearch',
																hugeicons: 'SearchIcon',
																phosphor: 'MagnifyingGlassIcon',
																remixicon: 'RiSearchLine'
															});

															$$renderer.push(`<!----> Find &amp; Replace `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘F`);
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
															IconPlaceholder($$renderer, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine'
															});

															$$renderer.push(`<!----> Spell Check`);
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
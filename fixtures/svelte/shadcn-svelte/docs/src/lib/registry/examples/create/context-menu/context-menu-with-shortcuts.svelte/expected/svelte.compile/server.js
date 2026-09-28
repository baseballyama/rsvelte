import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_shortcuts($$renderer) {
	Example($$renderer, {
		title: 'With Shortcuts',
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
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
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
															$$renderer.push(`<!---->Save `);

															if (ContextMenu.Shortcut) {
																$$renderer.push('<!--[-->');

																ContextMenu.Shortcut($$renderer, {
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

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Save As... `);

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
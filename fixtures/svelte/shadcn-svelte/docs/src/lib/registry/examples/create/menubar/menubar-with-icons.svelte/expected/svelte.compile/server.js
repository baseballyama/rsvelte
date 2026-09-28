import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
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
																lucide: 'FileIcon',
																tabler: 'IconFile',
																hugeicons: 'FileIcon',
																phosphor: 'FileIcon',
																remixicon: 'RiFileLine'
															});

															$$renderer.push(`<!----> New File `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘N`);
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
																lucide: 'FolderIcon',
																tabler: 'IconFolder',
																hugeicons: 'FolderIcon',
																phosphor: 'FolderIcon',
																remixicon: 'RiFolderLine'
															});

															$$renderer.push(`<!----> Open Folder`);
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
																lucide: 'SaveIcon',
																tabler: 'IconDeviceFloppy',
																hugeicons: 'FloppyDiskIcon',
																phosphor: 'FloppyDiskIcon',
																remixicon: 'RiSaveLine'
															});

															$$renderer.push(`<!----> Save `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
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
												$$renderer.push(`<!---->More`);
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
												if (Menubar.Group) {
													$$renderer.push('<!--[-->');

													Menubar.Group($$renderer, {
														children: ($$renderer) => {
															if (Menubar.Item) {
																$$renderer.push('<!--[-->');

																Menubar.Item($$renderer, {
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'CircleDashedIcon',
																			tabler: 'IconCircleDashed',
																			hugeicons: 'DashedLineCircleIcon',
																			phosphor: 'CircleDashedIcon',
																			remixicon: 'RiLoaderLine'
																		});

																		$$renderer.push(`<!----> Settings`);
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
																			lucide: 'CircleDashedIcon',
																			tabler: 'IconCircleDashed',
																			hugeicons: 'DashedLineCircleIcon',
																			phosphor: 'CircleDashedIcon',
																			remixicon: 'RiLoaderLine'
																		});

																		$$renderer.push(`<!----> Help`);
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
																			lucide: 'CircleDashedIcon',
																			tabler: 'IconCircleDashed',
																			hugeicons: 'DashedLineCircleIcon',
																			phosphor: 'CircleDashedIcon',
																			remixicon: 'RiLoaderLine'
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
import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_destructive($$renderer) {
	Example($$renderer, {
		title: 'Destructive',
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
											class: 'w-40',
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
														variant: 'destructive',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															$$renderer.push(`<!----> Delete File `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘⌫`);
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
												$$renderer.push(`<!---->Account`);
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
																lucide: 'UserIcon',
																tabler: 'IconUser',
																hugeicons: 'UserIcon',
																phosphor: 'UserIcon',
																remixicon: 'RiUserLine'
															});

															$$renderer.push(`<!----> Profile`);
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
																lucide: 'SettingsIcon',
																tabler: 'IconSettings',
																hugeicons: 'SettingsIcon',
																phosphor: 'GearIcon',
																remixicon: 'RiSettingsLine'
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
																lucide: 'LogOutIcon',
																tabler: 'IconLogout',
																hugeicons: 'LogoutIcon',
																phosphor: 'SignOutIcon',
																remixicon: 'RiLogoutBoxLine'
															});

															$$renderer.push(`<!----> Sign out`);
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
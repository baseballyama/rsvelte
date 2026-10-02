import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
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
															$$renderer.push(`<!---->New Tab `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘T`);
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
															$$renderer.push(`<!---->New Window `);

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
														disabled: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->New Incognito Window`);
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
															$$renderer.push(`<!---->Print... `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘P`);
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
															$$renderer.push(`<!---->Cut`);
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
															$$renderer.push(`<!---->Copy`);
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
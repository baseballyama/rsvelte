import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_format($$renderer) {
	Example($$renderer, {
		title: 'Format',
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
												$$renderer.push(`<!---->Format`);
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
																lucide: 'BoldIcon',
																tabler: 'IconBold',
																hugeicons: 'TextBoldIcon',
																phosphor: 'TextBIcon',
																remixicon: 'RiBold'
															});

															$$renderer.push(`<!----> Bold `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘B`);
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
																lucide: 'ItalicIcon',
																tabler: 'IconItalic',
																hugeicons: 'TextItalicIcon',
																phosphor: 'TextItalicIcon',
																remixicon: 'RiItalic'
															});

															$$renderer.push(`<!----> Italic `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘I`);
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
																lucide: 'UnderlineIcon',
																tabler: 'IconUnderline',
																hugeicons: 'TextUnderlineIcon',
																phosphor: 'TextUnderlineIcon',
																remixicon: 'RiUnderline'
															});

															$$renderer.push(`<!----> Underline `);

															if (Menubar.Shortcut) {
																$$renderer.push('<!--[-->');

																Menubar.Shortcut($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘U`);
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

												if (Menubar.CheckboxItem) {
													$$renderer.push('<!--[-->');

													Menubar.CheckboxItem($$renderer, {
														checked: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Strikethrough`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!---->Code`);
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
											children: ($$renderer) => {
												if (Menubar.CheckboxItem) {
													$$renderer.push('<!--[-->');

													Menubar.CheckboxItem($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Show Ruler`);
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
														checked: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Show Grid`);
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
														inset: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Zoom In`);
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
															$$renderer.push(`<!---->Zoom Out`);
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
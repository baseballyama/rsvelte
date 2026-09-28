import * as $ from 'svelte/internal/server';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Nested($$renderer) {
	Menu($$renderer, {
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Menu`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (Menu.Positioner) {
						$$renderer.push('<!--[-->');

						Menu.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Menu.Content) {
									$$renderer.push('<!--[-->');

									Menu.Content($$renderer, {
										children: ($$renderer) => {
											Menu($$renderer, {
												children: ($$renderer) => {
													if (Menu.TriggerItem) {
														$$renderer.push('<!--[-->');

														Menu.TriggerItem($$renderer, {
															value: 'new',
															children: ($$renderer) => {
																if (Menu.ItemText) {
																	$$renderer.push('<!--[-->');

																	Menu.ItemText($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->New`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Menu.ItemIndicator) {
																	$$renderer.push('<!--[-->');

																	Menu.ItemIndicator($$renderer, {
																		children: ($$renderer) => {
																			ChevronRightIcon($$renderer, { class: 'size-4' });
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

													Portal($$renderer, {
														children: ($$renderer) => {
															if (Menu.Positioner) {
																$$renderer.push('<!--[-->');

																Menu.Positioner($$renderer, {
																	children: ($$renderer) => {
																		if (Menu.Content) {
																			$$renderer.push('<!--[-->');

																			Menu.Content($$renderer, {
																				children: ($$renderer) => {
																					if (Menu.Item) {
																						$$renderer.push('<!--[-->');

																						Menu.Item($$renderer, {
																							value: 'project',
																							children: ($$renderer) => {
																								if (Menu.ItemText) {
																									$$renderer.push('<!--[-->');

																									Menu.ItemText($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->New Project`);
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

																					if (Menu.Item) {
																						$$renderer.push('<!--[-->');

																						Menu.Item($$renderer, {
																							value: 'file',
																							children: ($$renderer) => {
																								if (Menu.ItemText) {
																									$$renderer.push('<!--[-->');

																									Menu.ItemText($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->New File`);
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

																					if (Menu.Item) {
																						$$renderer.push('<!--[-->');

																						Menu.Item($$renderer, {
																							value: 'folder',
																							children: ($$renderer) => {
																								if (Menu.ItemText) {
																									$$renderer.push('<!--[-->');

																									Menu.ItemText($$renderer, {
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->New Folder`);
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

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Menu.Item) {
												$$renderer.push('<!--[-->');

												Menu.Item($$renderer, {
													value: 'open',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Open File`);
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

											if (Menu.Separator) {
												$$renderer.push('<!--[-->');
												Menu.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menu.Item) {
												$$renderer.push('<!--[-->');

												Menu.Item($$renderer, {
													value: 'save',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Save`);
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

											if (Menu.Item) {
												$$renderer.push('<!--[-->');

												Menu.Item($$renderer, {
													value: 'export',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Export`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
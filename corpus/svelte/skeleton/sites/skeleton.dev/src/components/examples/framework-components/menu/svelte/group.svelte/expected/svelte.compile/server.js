import * as $ from 'svelte/internal/server';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Group($$renderer) {
	Menu($$renderer, {
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->View Options`);
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
											if (Menu.ItemGroup) {
												$$renderer.push('<!--[-->');

												Menu.ItemGroup($$renderer, {
													children: ($$renderer) => {
														if (Menu.ItemGroupLabel) {
															$$renderer.push('<!--[-->');

															Menu.ItemGroupLabel($$renderer, {
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

														if (Menu.Item) {
															$$renderer.push('<!--[-->');

															Menu.Item($$renderer, {
																value: 'split',
																children: ($$renderer) => {
																	if (Menu.ItemText) {
																		$$renderer.push('<!--[-->');

																		Menu.ItemText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Split View`);
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
																value: 'fullscreen',
																children: ($$renderer) => {
																	if (Menu.ItemText) {
																		$$renderer.push('<!--[-->');

																		Menu.ItemText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Fullscreen`);
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

											if (Menu.Separator) {
												$$renderer.push('<!--[-->');
												Menu.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Menu.ItemGroup) {
												$$renderer.push('<!--[-->');

												Menu.ItemGroup($$renderer, {
													children: ($$renderer) => {
														if (Menu.ItemGroupLabel) {
															$$renderer.push('<!--[-->');

															Menu.ItemGroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Appearance`);
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
																value: 'theme',
																children: ($$renderer) => {
																	if (Menu.ItemText) {
																		$$renderer.push('<!--[-->');

																		Menu.ItemText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Change Theme`);
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
																value: 'zoom',
																children: ($$renderer) => {
																	if (Menu.ItemText) {
																		$$renderer.push('<!--[-->');

																		Menu.ItemText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Zoom`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
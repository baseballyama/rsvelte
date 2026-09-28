import * as $ from 'svelte/internal/server';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Menu($$renderer, {
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
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
											if (Menu.Item) {
												$$renderer.push('<!--[-->');

												Menu.Item($$renderer, {
													value: 'new',
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

											$$renderer.push(` `);

											if (Menu.Item) {
												$$renderer.push('<!--[-->');

												Menu.Item($$renderer, {
													value: 'disabled',
													disabled: true,
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Disabled`);
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
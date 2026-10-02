import * as $ from 'svelte/internal/server';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Context($$renderer) {
	Menu($$renderer, {
		children: ($$renderer) => {
			if (Menu.ContextTrigger) {
				$$renderer.push('<!--[-->');

				Menu.ContextTrigger($$renderer, {
					class: 'card border border-dashed border-surface-200-800 p-8',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Right-click here`);
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
													value: 'cut',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
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
													value: 'copy',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
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
													value: 'paste',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
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
													value: 'delete',
													children: ($$renderer) => {
														if (Menu.ItemText) {
															$$renderer.push('<!--[-->');

															Menu.ItemText($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Delete`);
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
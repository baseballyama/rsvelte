import * as $ from 'svelte/internal/server';
import { ContextMenu } from "bits-ui";

export default function Context_menu_nested_test($$renderer) {
	if (ContextMenu.Root) {
		$$renderer.push('<!--[-->');

		ContextMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (ContextMenu.Trigger) {
					$$renderer.push('<!--[-->');

					ContextMenu.Trigger($$renderer, {
						'data-testid': 'trigger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ContextMenu.Portal) {
					$$renderer.push('<!--[-->');

					ContextMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Content) {
								$$renderer.push('<!--[-->');

								ContextMenu.Content($$renderer, {
									'data-testid': 'content',
									children: ($$renderer) => {
										if (ContextMenu.Root) {
											$$renderer.push('<!--[-->');

											ContextMenu.Root($$renderer, {
												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															if (ContextMenu.Item) {
																$$renderer.push('<!--[-->');

																ContextMenu.Item($$renderer, $.spread_props([
																	props,
																	{
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->item`);
																		},
																		$$slots: { default: true }
																	}
																]));

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (ContextMenu.Portal) {
																$$renderer.push('<!--[-->');

																ContextMenu.Portal($$renderer, {
																	children: ($$renderer) => {
																		if (ContextMenu.Content) {
																			$$renderer.push('<!--[-->');

																			ContextMenu.Content($$renderer, {
																				'data-testid': 'nested-content',
																				children: ($$renderer) => {
																					if (ContextMenu.Item) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.Item($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->some nested item`);
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
														}

														if (ContextMenu.Trigger) {
															$$renderer.push('<!--[-->');

															ContextMenu.Trigger($$renderer, {
																'data-testid': 'nested-trigger',
																child,
																$$slots: { child: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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
}
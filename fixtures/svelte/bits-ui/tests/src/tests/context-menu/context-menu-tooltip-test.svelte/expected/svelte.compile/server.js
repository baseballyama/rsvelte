import * as $ from 'svelte/internal/server';
import { Tooltip, ContextMenu } from "bits-ui";

export default function Context_menu_tooltip_test($$renderer) {
	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						delayDuration: 0,
						children: ($$renderer) => {
							if (Tooltip.Trigger) {
								$$renderer.push('<!--[-->');

								Tooltip.Trigger($$renderer, {
									'data-testid': 'tooltip-trigger',
									children: ($$renderer) => {
										if (ContextMenu.Root) {
											$$renderer.push('<!--[-->');

											ContextMenu.Root($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Trigger) {
														$$renderer.push('<!--[-->');

														ContextMenu.Trigger($$renderer, {
															'data-testid': 'context-menu-trigger',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Right click me`);
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
																		'data-testid': 'context-menu-content',
																		children: ($$renderer) => {
																			if (ContextMenu.Item) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.Item($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Item1`);
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
																						$$renderer.push(`<!---->Item2`);
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

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									'data-testid': 'tooltip-content',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Tooltip content`);
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
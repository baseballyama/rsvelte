import * as $ from 'svelte/internal/server';
import { ContextMenu } from "bits-ui";

export default function Context_menu_nested_submenu_test($$renderer) {
	if (ContextMenu.Root) {
		$$renderer.push('<!--[-->');

		ContextMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (ContextMenu.Trigger) {
					$$renderer.push('<!--[-->');

					ContextMenu.Trigger($$renderer, {
						'data-testid': 'trigger',
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
									'data-testid': 'content',
									children: ($$renderer) => {
										if (ContextMenu.Sub) {
											$$renderer.push('<!--[-->');

											ContextMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														ContextMenu.SubTrigger($$renderer, {
															'data-testid': 'sub-trigger',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Sub`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (ContextMenu.SubContent) {
														$$renderer.push('<!--[-->');

														ContextMenu.SubContent($$renderer, {
															'data-testid': 'sub-content',
															children: ($$renderer) => {
																if (ContextMenu.Sub) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Sub($$renderer, {
																		children: ($$renderer) => {
																			if (ContextMenu.SubTrigger) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.SubTrigger($$renderer, {
																					'data-testid': 'sub-sub-trigger',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Sub-sub`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (ContextMenu.SubContent) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.SubContent($$renderer, {
																					'data-testid': 'sub-sub-content',
																					children: ($$renderer) => {
																						if (ContextMenu.Item) {
																							$$renderer.push('<!--[-->');

																							ContextMenu.Item($$renderer, {
																								'data-testid': 'sub-sub-item',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Hello`);
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
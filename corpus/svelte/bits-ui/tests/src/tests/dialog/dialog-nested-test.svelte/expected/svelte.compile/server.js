import * as $ from 'svelte/internal/server';
import { Dialog } from "bits-ui";

export default function Dialog_nested_test($$renderer) {
	$$renderer.push(`<main>`);

	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						'data-testid': 'first-open',
						children: ($$renderer) => {
							$$renderer.push(`<!---->first open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Dialog.Portal) {
					$$renderer.push('<!--[-->');

					Dialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Overlay) {
								$$renderer.push('<!--[-->');
								Dialog.Overlay($$renderer, { 'data-testid': 'first-overlay' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									'data-testid': 'first-content',
									children: ($$renderer) => {
										if (Dialog.Close) {
											$$renderer.push('<!--[-->');

											Dialog.Close($$renderer, {
												'data-testid': 'first-close',
												children: ($$renderer) => {
													$$renderer.push(`<!---->first close`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Dialog.Root) {
											$$renderer.push('<!--[-->');

											Dialog.Root($$renderer, {
												children: ($$renderer) => {
													if (Dialog.Trigger) {
														$$renderer.push('<!--[-->');

														Dialog.Trigger($$renderer, {
															'data-testid': 'second-open',
															children: ($$renderer) => {
																$$renderer.push(`<!---->second open`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Dialog.Portal) {
														$$renderer.push('<!--[-->');

														Dialog.Portal($$renderer, {
															children: ($$renderer) => {
																if (Dialog.Overlay) {
																	$$renderer.push('<!--[-->');
																	Dialog.Overlay($$renderer, { 'data-testid': 'second-overlay' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Dialog.Content) {
																	$$renderer.push('<!--[-->');

																	Dialog.Content($$renderer, {
																		'data-testid': 'second-content',
																		children: ($$renderer) => {
																			if (Dialog.Close) {
																				$$renderer.push('<!--[-->');

																				Dialog.Close($$renderer, {
																					'data-testid': 'second-close',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->second close`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Dialog.Root) {
																				$$renderer.push('<!--[-->');

																				Dialog.Root($$renderer, {
																					children: ($$renderer) => {
																						if (Dialog.Trigger) {
																							$$renderer.push('<!--[-->');

																							Dialog.Trigger($$renderer, {
																								'data-testid': 'third-open',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->third open`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (Dialog.Portal) {
																							$$renderer.push('<!--[-->');

																							Dialog.Portal($$renderer, {
																								children: ($$renderer) => {
																									if (Dialog.Overlay) {
																										$$renderer.push('<!--[-->');
																										Dialog.Overlay($$renderer, { 'data-testid': 'third-overlay' });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Dialog.Content) {
																										$$renderer.push('<!--[-->');

																										Dialog.Content($$renderer, {
																											'data-testid': 'third-content',
																											children: ($$renderer) => {
																												if (Dialog.Close) {
																													$$renderer.push('<!--[-->');

																													Dialog.Close($$renderer, {
																														'data-testid': 'third-close',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->third close`);
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

	$$renderer.push(` <div id="portalTarget" data-testid="portalTarget"></div></main>`);
}
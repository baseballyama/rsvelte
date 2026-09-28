import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

export default function Command_grid_test($$renderer, $$props) {
	let { separatorProps, $$slots, $$events, ...rest } = $$props;

	if (Command.Root) {
		$$renderer.push('<!--[-->');

		Command.Root($$renderer, $.spread_props([
			rest,
			{
				columns: 3,
				'data-testid': 'root',
				children: ($$renderer) => {
					if (Command.Input) {
						$$renderer.push('<!--[-->');
						Command.Input($$renderer, { 'data-testid': 'input', 'aria-label': 'Search' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Command.List) {
						$$renderer.push('<!--[-->');

						Command.List($$renderer, {
							'data-testid': 'list',
							children: ($$renderer) => {
								if (Command.Viewport) {
									$$renderer.push('<!--[-->');

									Command.Viewport($$renderer, {
										'data-testid': 'viewport',
										children: ($$renderer) => {
											if (Command.Empty) {
												$$renderer.push('<!--[-->');

												Command.Empty($$renderer, {
													'data-testid': 'empty',
													children: ($$renderer) => {
														$$renderer.push(`<!---->No results found.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Command.Group) {
												$$renderer.push('<!--[-->');

												Command.Group($$renderer, {
													'data-testid': 'group-a',
													children: ($$renderer) => {
														if (Command.GroupHeading) {
															$$renderer.push('<!--[-->');

															Command.GroupHeading($$renderer, {
																'data-testid': 'group-a-heading',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Suggestions`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.GroupItems) {
															$$renderer.push('<!--[-->');

															Command.GroupItems($$renderer, {
																'data-testid': 'group-a-items',
																children: ($$renderer) => {
																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-introduction',
																			keywords: ["getting started", "tutorial"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Introduction`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-delegation',
																			keywords: ["child", "custom element", "snippets"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Delegation`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-styling',
																			keywords: ["css", "theme", "colors", "fonts", "tailwind"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Styling`);
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

											if (Command.Separator) {
												$$renderer.push('<!--[-->');
												Command.Separator($$renderer, $.spread_props([{ 'data-testid': 'separator' }, separatorProps]));
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Command.Group) {
												$$renderer.push('<!--[-->');

												Command.Group($$renderer, {
													'data-testid': 'group-b',
													children: ($$renderer) => {
														if (Command.GroupHeading) {
															$$renderer.push('<!--[-->');

															Command.GroupHeading($$renderer, {
																'data-testid': 'group-b-heading',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Components`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.GroupItems) {
															$$renderer.push('<!--[-->');

															Command.GroupItems($$renderer, {
																'data-testid': 'group-b-items',
																children: ($$renderer) => {
																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-calendar',
																			keywords: ["dates", "times"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Calendar`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-radio-group',
																			keywords: ["buttons", "forms"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Radio Group`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Item) {
																		$$renderer.push('<!--[-->');

																		Command.Item($$renderer, {
																			'data-testid': 'item-combobox',
																			keywords: ["inputs", "text", "autocomplete"],
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Combobox`);
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
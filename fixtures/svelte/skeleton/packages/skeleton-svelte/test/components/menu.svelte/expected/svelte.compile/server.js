import * as $ from 'svelte/internal/server';
import { Menu } from '../../src/index.js';

export default function Menu_1($$renderer) {
	Menu($$renderer, {
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					'data-testid': 'trigger',
					children: ($$renderer) => {
						if (Menu.Indicator) {
							$$renderer.push('<!--[-->');
							Menu.Indicator($$renderer, { 'data-testid': 'indicator' });
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

			if (Menu.ContextTrigger) {
				$$renderer.push('<!--[-->');

				Menu.ContextTrigger($$renderer, {
					'data-testid': 'context-trigger',
					children: ($$renderer) => {
						if (Menu.Indicator) {
							$$renderer.push('<!--[-->');
							Menu.Indicator($$renderer, { 'data-testid': 'indicator' });
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

			if (Menu.Positioner) {
				$$renderer.push('<!--[-->');

				Menu.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (Menu.Content) {
							$$renderer.push('<!--[-->');

							Menu.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (Menu.ItemGroup) {
										$$renderer.push('<!--[-->');

										Menu.ItemGroup($$renderer, {
											'data-testid': 'item-group',
											children: ($$renderer) => {
												if (Menu.ItemGroupLabel) {
													$$renderer.push('<!--[-->');
													Menu.ItemGroupLabel($$renderer, { 'data-testid': 'item-group-label' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Menu.Item) {
													$$renderer.push('<!--[-->');

													Menu.Item($$renderer, {
														value: 'item',
														'data-testid': 'item',
														children: ($$renderer) => {
															if (Menu.ItemText) {
																$$renderer.push('<!--[-->');
																Menu.ItemText($$renderer, { 'data-testid': 'item-text' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Menu.ItemIndicator) {
																$$renderer.push('<!--[-->');
																Menu.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
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

												if (Menu.OptionItem) {
													$$renderer.push('<!--[-->');

													Menu.OptionItem($$renderer, {
														value: 'option-item',
														'data-testid': 'option-item',
														type: 'checkbox',
														checked: false,
														children: ($$renderer) => {
															if (Menu.ItemText) {
																$$renderer.push('<!--[-->');
																Menu.ItemText($$renderer, { 'data-testid': 'item-text' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Menu.ItemIndicator) {
																$$renderer.push('<!--[-->');
																Menu.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
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

												Menu($$renderer, {
													children: ($$renderer) => {
														if (Menu.TriggerItem) {
															$$renderer.push('<!--[-->');

															Menu.TriggerItem($$renderer, {
																value: 'trigger-item',
																'data-testid': 'trigger-item',
																children: ($$renderer) => {
																	if (Menu.ItemText) {
																		$$renderer.push('<!--[-->');
																		Menu.ItemText($$renderer, { 'data-testid': 'item-text' });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menu.ItemIndicator) {
																		$$renderer.push('<!--[-->');
																		Menu.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Menu.Separator) {
										$$renderer.push('<!--[-->');
										Menu.Separator($$renderer, { 'data-testid': 'separator' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Menu.Arrow) {
										$$renderer.push('<!--[-->');

										Menu.Arrow($$renderer, {
											'data-testid': 'arrow',
											children: ($$renderer) => {
												if (Menu.ArrowTip) {
													$$renderer.push('<!--[-->');
													Menu.ArrowTip($$renderer, { 'data-testid': 'arrow-tip' });
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
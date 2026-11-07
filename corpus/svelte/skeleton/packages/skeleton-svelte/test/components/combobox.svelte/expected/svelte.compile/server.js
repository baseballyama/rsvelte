import * as $ from 'svelte/internal/server';
import { Combobox } from '../../src/index.js';

export default function Combobox_1($$renderer) {
	Combobox($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Combobox.Label) {
				$$renderer.push('<!--[-->');
				Combobox.Label($$renderer, { 'data-testid': 'label' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Combobox.Control) {
				$$renderer.push('<!--[-->');

				Combobox.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (Combobox.Input) {
							$$renderer.push('<!--[-->');
							Combobox.Input($$renderer, { 'data-testid': 'input' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Combobox.Trigger) {
							$$renderer.push('<!--[-->');
							Combobox.Trigger($$renderer, { 'data-testid': 'trigger' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Combobox.ClearTrigger) {
							$$renderer.push('<!--[-->');
							Combobox.ClearTrigger($$renderer, { 'data-testid': 'clear-trigger' });
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

			if (Combobox.Positioner) {
				$$renderer.push('<!--[-->');

				Combobox.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (Combobox.Content) {
							$$renderer.push('<!--[-->');

							Combobox.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (Combobox.ItemGroup) {
										$$renderer.push('<!--[-->');

										Combobox.ItemGroup($$renderer, {
											'data-testid': 'item-group',
											children: ($$renderer) => {
												if (Combobox.ItemGroupLabel) {
													$$renderer.push('<!--[-->');
													Combobox.ItemGroupLabel($$renderer, { 'data-testid': 'item-group-label' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Combobox.Item) {
													$$renderer.push('<!--[-->');

													Combobox.Item($$renderer, {
														item: 'item',
														'data-testid': 'item',
														children: ($$renderer) => {
															if (Combobox.ItemText) {
																$$renderer.push('<!--[-->');

																Combobox.ItemText($$renderer, {
																	'data-testid': 'item-text',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Item`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Combobox.ItemIndicator) {
																$$renderer.push('<!--[-->');
																Combobox.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
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
}
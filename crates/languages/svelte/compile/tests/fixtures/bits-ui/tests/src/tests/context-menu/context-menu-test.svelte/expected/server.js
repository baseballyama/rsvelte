import * as $ from 'svelte/internal/server';
import { ContextMenu } from "bits-ui";

export default function Context_menu_test($$renderer, $$props) {
	let {
		checked = false,
		subChecked = false,
		radio = "",
		subRadio = "",
		open = false,
		group = [],
		contentProps = {},
		portalProps = {},
		subTriggerProps = {},
		checkboxGroupProps = {},
		openFocusOverride = false,
		triggerProps = {},
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main class="flex flex-col gap-4"><button data-testid="previous-button">previous button</button> <div data-testid="non-portal-container">`);

		if (ContextMenu.Root) {
			$$renderer.push('<!--[-->');

			ContextMenu.Root($$renderer, $.spread_props([
				restProps,
				{
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, $.spread_props([
								{
									'data-testid': 'trigger',
									class: 'h-[500px] w-[500px]',
									'aria-expanded': undefined,
									'aria-controls': undefined
								},
								triggerProps,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->open`);
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

							ContextMenu.Portal($$renderer, $.spread_props([
								portalProps,
								{
									children: ($$renderer) => {
										if (ContextMenu.Content) {
											$$renderer.push('<!--[-->');

											ContextMenu.Content($$renderer, $.spread_props([
												contentProps,
												{
													'data-testid': 'content',
													children: ($$renderer) => {
														if (ContextMenu.Separator) {
															$$renderer.push('<!--[-->');
															ContextMenu.Separator($$renderer, { 'data-testid': 'separator' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.Group) {
															$$renderer.push('<!--[-->');

															ContextMenu.Group($$renderer, {
																'data-testid': 'group',
																children: ($$renderer) => {
																	if (ContextMenu.GroupHeading) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.GroupHeading($$renderer, {
																			'data-testid': 'group-heading',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Stuff`);
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
																			'data-testid': 'item',
																			children: ($$renderer) => {
																				$$renderer.push(`<span>item</span>`);
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

														if (ContextMenu.Sub) {
															$$renderer.push('<!--[-->');

															ContextMenu.Sub($$renderer, {
																children: ($$renderer) => {
																	if (ContextMenu.SubTrigger) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.SubTrigger($$renderer, $.spread_props([
																			{ 'data-testid': 'sub-trigger' },
																			subTriggerProps,
																			{
																				children: ($$renderer) => {
																					$$renderer.push(`<span>subtrigger</span>`);
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

																	if (ContextMenu.SubContent) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.SubContent($$renderer, {
																			'data-testid': 'sub-content',
																			children: ($$renderer) => {
																				if (ContextMenu.Item) {
																					$$renderer.push('<!--[-->');

																					ContextMenu.Item($$renderer, {
																						'data-testid': 'sub-item',
																						children: ($$renderer) => {
																							$$renderer.push(`<span>Email</span>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				{
																					function children($$renderer, { checked, indeterminate: _indeterminate }) {
																						$$renderer.push(`<span data-testid="sub-checkbox-indicator">${$.escape(checked)}</span> sub checkbox`);
																					}

																					if (ContextMenu.CheckboxItem) {
																						$$renderer.push('<!--[-->');

																						ContextMenu.CheckboxItem($$renderer, {
																							'data-testid': 'sub-checkbox-item',
																							get checked() {
																								return subChecked;
																							},

																							set checked($$value) {
																								subChecked = $$value;
																								$$settled = false;
																							},
																							children,
																							$$slots: { default: true }
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

														$$renderer.push(` `);

														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																disabled: true,
																'data-testid': 'disabled-item',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->disabled item`);
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
																disabled: true,
																'data-testid': 'disabled-item-2',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->disabled item 2`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														{
															function children($$renderer, { checked, indeterminate: _indeterminate }) {
																$$renderer.push(`<span data-testid="checkbox-indicator">${$.escape(checked)}</span> Checkbox Item`);
															}

															if (ContextMenu.CheckboxItem) {
																$$renderer.push('<!--[-->');

																ContextMenu.CheckboxItem($$renderer, {
																	'data-testid': 'checkbox-item',
																	get checked() {
																		return checked;
																	},

																	set checked($$value) {
																		checked = $$value;
																		$$settled = false;
																	},
																	children,
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);

														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																'data-testid': 'item-2',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->item 2`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ContextMenu.RadioGroup) {
															$$renderer.push('<!--[-->');

															ContextMenu.RadioGroup($$renderer, {
																'data-testid': 'radio-group',
																get value() {
																	return radio;
																},

																set value($$value) {
																	radio = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	{
																		function children($$renderer, { checked }) {
																			$$renderer.push(`<span data-testid="radio-indicator-1">${$.escape(checked)}</span> <span>Radio Item 1</span>`);
																		}

																		if (ContextMenu.RadioItem) {
																			$$renderer.push('<!--[-->');

																			ContextMenu.RadioItem($$renderer, {
																				value: '1',
																				'data-testid': 'radio-item',
																				children,
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(` `);

																	{
																		function children($$renderer, { checked }) {
																			$$renderer.push(`<span data-testid="radio-indicator-2">${$.escape(checked)}</span> <span>Radio Item 2</span>`);
																		}

																		if (ContextMenu.RadioItem) {
																			$$renderer.push('<!--[-->');

																			ContextMenu.RadioItem($$renderer, {
																				value: '2',
																				'data-testid': 'radio-item-2',
																				children,
																				$$slots: { default: true }
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

														$$renderer.push(` `);

														if (ContextMenu.CheckboxGroup) {
															$$renderer.push('<!--[-->');

															ContextMenu.CheckboxGroup($$renderer, $.spread_props([
																{ 'data-testid': 'checkbox-group' },
																checkboxGroupProps,
																{
																	get value() {
																		return group;
																	},

																	set value($$value) {
																		group = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		{
																			function children($$renderer, { checked }) {
																				$$renderer.push(`<span data-testid="checkbox-indicator-1">${$.escape(checked)}</span> <span>Checkbox Item 1</span>`);
																			}

																			if (ContextMenu.CheckboxItem) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.CheckboxItem($$renderer, {
																					value: '1',
																					'data-testid': 'checkbox-group-item-1',
																					children,
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(` `);

																		{
																			function children($$renderer, { checked }) {
																				$$renderer.push(`<span data-testid="checkbox-indicator-2">${$.escape(checked)}</span> <span>Checkbox Item 2</span>`);
																			}

																			if (ContextMenu.CheckboxItem) {
																				$$renderer.push('<!--[-->');

																				ContextMenu.CheckboxItem($$renderer, {
																					value: '2',
																					'data-testid': 'checkbox-group-item-2',
																					children,
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
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

														$$renderer.push(` `);

														if (openFocusOverride) {
															$$renderer.push(`<!--[0--><button data-testid="on-open-focus-override" id="on-open-focus-override">on-open-focus-override</button>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												}
											]));

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
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <button data-testid="next-button">next button</button> <button data-testid="binding">${$.escape(open)}</button> <button data-testid="checked-binding">${$.escape(checked)}</button> <button data-testid="sub-checked-binding">${$.escape(subChecked)}</button> <button aria-label="radio-main" data-testid="radio-binding">${$.escape(radio)}</button> <button aria-label="radio-sub" data-testid="sub-radio-binding">${$.escape(subRadio)}</button> <button data-testid="on-close-focus-override" id="on-close-focus-override">on-close-focus-override</button> <button aria-label="checkbox-group-binding" data-testid="checkbox-group-binding">Group value: ${$.escape(group)}</button> <div id="portal-target" data-testid="portal-target"></div> <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
import * as $ from 'svelte/internal/server';
import { DropdownMenu } from "bits-ui";

export default function Dropdown_menu_test($$renderer, $$props) {
	let {
		checked = false,
		subChecked = false,
		radio = "",
		group = [],
		subRadio = "",
		open = false,
		contentProps = {},
		portalProps = {},
		subTriggerProps = {},
		checkboxGroupProps = {},
		openFocusOverride = false,
		subItemProps = {},
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main class="flex flex-col gap-4"><div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="previous-button">previous button</button> <div data-testid="non-portal-container">`);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, $.spread_props([
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
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								'data-testid': 'trigger',
								class: 'h-[500px] w-[500px]',
								'aria-expanded': undefined,
								'aria-controls': undefined,
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

						if (DropdownMenu.Portal) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Portal($$renderer, $.spread_props([
								portalProps,
								{
									children: ($$renderer) => {
										if (DropdownMenu.Content) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Content($$renderer, $.spread_props([
												contentProps,
												{
													'data-testid': 'content',
													class: 'bg-gray-100 p-4',
													children: ($$renderer) => {
														if (DropdownMenu.Separator) {
															$$renderer.push('<!--[-->');
															DropdownMenu.Separator($$renderer, { 'data-testid': 'separator' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Group) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Group($$renderer, {
																'data-testid': 'group',
																children: ($$renderer) => {
																	if (DropdownMenu.GroupHeading) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.GroupHeading($$renderer, {
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

																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			'data-testid': 'item',
																			class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

														if (DropdownMenu.Sub) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Sub($$renderer, {
																children: ($$renderer) => {
																	if (DropdownMenu.SubTrigger) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.SubTrigger($$renderer, $.spread_props([
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

																	if (DropdownMenu.Portal) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Portal($$renderer, {
																			children: ($$renderer) => {
																				if (DropdownMenu.SubContent) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.SubContent($$renderer, {
																						'data-testid': 'sub-content',
																						children: ($$renderer) => {
																							if (DropdownMenu.Item) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Item($$renderer, $.spread_props([
																									subItemProps,
																									{
																										'data-testid': 'sub-item',
																										class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																										children: ($$renderer) => {
																											$$renderer.push(`<span>Email</span>`);
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

																							{
																								function children($$renderer, { checked, indeterminate: _indeterminate }) {
																									$$renderer.push(`<span data-testid="sub-checkbox-indicator">${$.escape(checked)}</span> sub checkbox`);
																								}

																								if (DropdownMenu.CheckboxItem) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.CheckboxItem($$renderer, {
																										'data-testid': 'sub-checkbox-item',
																										class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																disabled: true,
																'data-testid': 'disabled-item',
																class: 'focus:bg-gray-100 focus:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
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

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																disabled: true,
																'data-testid': 'disabled-item-2',
																class: 'focus:bg-gray-100 focus:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
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

															if (DropdownMenu.CheckboxItem) {
																$$renderer.push('<!--[-->');

																DropdownMenu.CheckboxItem($$renderer, {
																	'data-testid': 'checkbox-item',
																	class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																'data-testid': 'item-2',
																class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

														if (DropdownMenu.RadioGroup) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioGroup($$renderer, {
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

																		if (DropdownMenu.RadioItem) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.RadioItem($$renderer, {
																				value: '1',
																				'data-testid': 'radio-item',
																				class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

																		if (DropdownMenu.RadioItem) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.RadioItem($$renderer, {
																				value: '2',
																				'data-testid': 'radio-item-2',
																				class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

														if (DropdownMenu.CheckboxGroup) {
															$$renderer.push('<!--[-->');

															DropdownMenu.CheckboxGroup($$renderer, $.spread_props([
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

																			if (DropdownMenu.CheckboxItem) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.CheckboxItem($$renderer, {
																					value: '1',
																					'data-testid': 'checkbox-group-item-1',
																					class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

																			if (DropdownMenu.CheckboxItem) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.CheckboxItem($$renderer, {
																					value: '2',
																					'data-testid': 'checkbox-group-item-2',
																					class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

		$$renderer.push(`</div> <button data-testid="next-button">next button</button> <button data-testid="binding">${$.escape(open)}</button> <button data-testid="checked-binding">${$.escape(checked)}</button> <button data-testid="sub-checked-binding">${$.escape(subChecked)}</button> <button aria-label="radio-main" data-testid="radio-binding">${$.escape(radio)}</button> <button aria-label="radio-sub" data-testid="sub-radio-binding">${$.escape(subRadio)}</button> <button data-testid="on-close-focus-override" id="on-close-focus-override">on-close-focus-override</button> <button aria-label="checkbox-group-binding" data-testid="checkbox-group-binding">${$.escape(group)}</button> <div id="portal-target" data-testid="portal-target"></div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
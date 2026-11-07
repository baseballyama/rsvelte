import * as $ from 'svelte/internal/server';
import { Menubar } from "bits-ui";

export default function Menubar_menu_test($$renderer, $$props) {
	let { id, subTriggerProps, $$slots, $$events, ...restProps } = $$props;

	if (Menubar.Menu) {
		$$renderer.push('<!--[-->');

		Menubar.Menu($$renderer, $.spread_props([
			restProps,
			{
				children: ($$renderer) => {
					if (Menubar.Trigger) {
						$$renderer.push('<!--[-->');

						Menubar.Trigger($$renderer, {
							'data-testid': `${$.stringify(id)}-trigger`,
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

					if (Menubar.Content) {
						$$renderer.push('<!--[-->');

						Menubar.Content($$renderer, {
							'data-testid': `${$.stringify(id)}-content`,
							children: ($$renderer) => {
								if (Menubar.Separator) {
									$$renderer.push('<!--[-->');
									Menubar.Separator($$renderer, { 'data-testid': `${$.stringify(id)}-separator` });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Group) {
									$$renderer.push('<!--[-->');

									Menubar.Group($$renderer, {
										'data-testid': `${$.stringify(id)}-group`,
										children: ($$renderer) => {
											if (Menubar.GroupHeading) {
												$$renderer.push('<!--[-->');

												Menubar.GroupHeading($$renderer, {
													'data-testid': `${$.stringify(id)}-group-heading`,
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

											if (Menubar.Item) {
												$$renderer.push('<!--[-->');

												Menubar.Item($$renderer, {
													'data-testid': `${$.stringify(id)}-item`,
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

								if (Menubar.Sub) {
									$$renderer.push('<!--[-->');

									Menubar.Sub($$renderer, {
										children: ($$renderer) => {
											if (Menubar.SubTrigger) {
												$$renderer.push('<!--[-->');

												Menubar.SubTrigger($$renderer, $.spread_props([
													{ 'data-testid': `${$.stringify(id)}-sub-trigger` },
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

											if (Menubar.SubContent) {
												$$renderer.push('<!--[-->');

												Menubar.SubContent($$renderer, {
													'data-testid': `${$.stringify(id)}-sub-content`,
													children: ($$renderer) => {
														if (Menubar.Item) {
															$$renderer.push('<!--[-->');

															Menubar.Item($$renderer, {
																'data-testid': `${$.stringify(id)}-sub-item`,
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
																if (checked) {
																	$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(id)}-sub-checkbox-indicator`)}>checked</span>`);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--> sub checkbox`);
															}

															if (Menubar.CheckboxItem) {
																$$renderer.push('<!--[-->');

																Menubar.CheckboxItem($$renderer, {
																	'data-testid': `${$.stringify(id)}-sub-checkbox-item`,
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

								if (Menubar.Item) {
									$$renderer.push('<!--[-->');

									Menubar.Item($$renderer, {
										disabled: true,
										'data-testid': `${$.stringify(id)}-disabled-item`,
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

								if (Menubar.Item) {
									$$renderer.push('<!--[-->');

									Menubar.Item($$renderer, {
										disabled: true,
										'data-testid': `${$.stringify(id)}-disabled-item-2`,
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
										if (checked) {
											$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(id)}-checkbox-indicator`)}>checked</span>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> Checkbox Item`);
									}

									if (Menubar.CheckboxItem) {
										$$renderer.push('<!--[-->');

										Menubar.CheckboxItem($$renderer, {
											'data-testid': `${$.stringify(id)}-checkbox-item`,
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

								if (Menubar.Item) {
									$$renderer.push('<!--[-->');

									Menubar.Item($$renderer, {
										'data-testid': `${$.stringify(id)}-item-2`,
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

								if (Menubar.RadioGroup) {
									$$renderer.push('<!--[-->');

									Menubar.RadioGroup($$renderer, {
										'data-testid': `${$.stringify(id)}-radio-group`,
										children: ($$renderer) => {
											{
												function children($$renderer, { checked }) {
													if (checked) {
														$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(id)}-radio-indicator-1`)}>checked</span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> <span>Radio Item 1</span>`);
												}

												if (Menubar.RadioItem) {
													$$renderer.push('<!--[-->');

													Menubar.RadioItem($$renderer, {
														value: '1',
														'data-testid': `${$.stringify(id)}-radio-item`,
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
													if (checked) {
														$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(id)}-radio-indicator-2`)}>checked</span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> <span>Radio Item 2</span>`);
												}

												if (Menubar.RadioItem) {
													$$renderer.push('<!--[-->');

													Menubar.RadioItem($$renderer, {
														value: '2',
														'data-testid': `${$.stringify(id)}-radio-item-2`,
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
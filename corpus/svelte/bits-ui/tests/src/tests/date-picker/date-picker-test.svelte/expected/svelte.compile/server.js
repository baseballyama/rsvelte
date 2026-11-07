import * as $ from 'svelte/internal/server';
import { DatePicker } from "bits-ui";

export default function Date_picker_test($$renderer, $$props) {
	let {
		placeholder,
		value,
		open = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	function clear() {
		value = undefined;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><div data-testid="value">${$.escape(String(value))}</div> <div data-testid="open">${$.escape(open)}</div> <button data-testid="clear">clear</button> <button data-testid="toggle-open">toggle open</button> `);

		if (DatePicker.Root) {
			$$renderer.push('<!--[-->');

			DatePicker.Root($$renderer, $.spread_props([
				restProps,
				{
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					get placeholder() {
						return placeholder;
					},

					set placeholder($$value) {
						placeholder = $$value;
						$$settled = false;
					},

					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (DatePicker.Label) {
							$$renderer.push('<!--[-->');

							DatePicker.Label($$renderer, {
								'data-testid': 'label',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Date`);
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
							function children($$renderer, { segments }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(segments);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let { part, value } = each_array[i];

									if (DatePicker.Segment) {
										$$renderer.push('<!--[-->');

										DatePicker.Segment($$renderer, {
											part,
											'data-testid': part === "literal" ? undefined : part,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(value)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							if (DatePicker.Input) {
								$$renderer.push('<!--[-->');
								DatePicker.Input($$renderer, { 'data-testid': 'input', children, $$slots: { default: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DatePicker.Trigger) {
							$$renderer.push('<!--[-->');

							DatePicker.Trigger($$renderer, {
								'data-testid': 'trigger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Open`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DatePicker.Content) {
							$$renderer.push('<!--[-->');

							DatePicker.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									{
										function children($$renderer, { months, weekdays }) {
											if (DatePicker.Header) {
												$$renderer.push('<!--[-->');

												DatePicker.Header($$renderer, {
													'data-testid': 'header',
													children: ($$renderer) => {
														if (DatePicker.PrevButton) {
															$$renderer.push('<!--[-->');

															DatePicker.PrevButton($$renderer, {
																'data-testid': 'prev-button',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Prev`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DatePicker.Heading) {
															$$renderer.push('<!--[-->');
															DatePicker.Heading($$renderer, { 'data-testid': 'heading' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DatePicker.NextButton) {
															$$renderer.push('<!--[-->');

															DatePicker.NextButton($$renderer, {
																'data-testid': 'next-button',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Next`);
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

											$$renderer.push(` <div><!--[-->`);

											const each_array_1 = $.ensure_array_like(months);

											for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
												let month = each_array_1[i];
												const m = month.value.month;

												if (DatePicker.Grid) {
													$$renderer.push('<!--[-->');

													DatePicker.Grid($$renderer, {
														'data-testid': `grid-${$.stringify(m)}`,
														children: ($$renderer) => {
															if (DatePicker.GridHead) {
																$$renderer.push('<!--[-->');

																DatePicker.GridHead($$renderer, {
																	'data-testid': `grid-head-${$.stringify(m)}`,
																	children: ($$renderer) => {
																		if (DatePicker.GridRow) {
																			$$renderer.push('<!--[-->');

																			DatePicker.GridRow($$renderer, {
																				'data-testid': `grid-row-${$.stringify(m)}`,
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_2 = $.ensure_array_like(weekdays);

																					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
																						let day = each_array_2[i];

																						if (DatePicker.HeadCell) {
																							$$renderer.push('<!--[-->');

																							DatePicker.HeadCell($$renderer, {
																								'data-testid': `weekday-${$.stringify(m)}-${$.stringify(i)}`,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(day)}`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					}

																					$$renderer.push(`<!--]-->`);
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

															if (DatePicker.GridBody) {
																$$renderer.push('<!--[-->');

																DatePicker.GridBody($$renderer, {
																	'data-testid': `grid-body-${$.stringify(m)}`,
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_3 = $.ensure_array_like(month.weeks);

																		for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
																			let weekDates = each_array_3[i];

																			if (DatePicker.GridRow) {
																				$$renderer.push('<!--[-->');

																				DatePicker.GridRow($$renderer, {
																					'data-testid': `grid-row-${$.stringify(m)}-${$.stringify(i)}`,
																					'data-week': true,
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array_4 = $.ensure_array_like(weekDates);

																						for (let d = 0, $$length = each_array_4.length; d < $$length; d++) {
																							let date = each_array_4[d];

																							if (DatePicker.Cell) {
																								$$renderer.push('<!--[-->');

																								DatePicker.Cell($$renderer, {
																									date,
																									month: month.value,
																									'data-testid': `cell-${$.stringify(date.month)}-${$.stringify(d)}`,
																									class: 'p-3',
																									children: ($$renderer) => {
																										if (DatePicker.Day) {
																											$$renderer.push('<!--[-->');

																											DatePicker.Day($$renderer, {
																												'data-testid': `date-${$.stringify(date.month)}-${$.stringify(date.day)}`,
																												class: 'p-1',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(date.day)}`);
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

																						$$renderer.push(`<!--]-->`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]-->`);
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

											$$renderer.push(`<!--]--></div>`);
										}

										if (DatePicker.Calendar) {
											$$renderer.push('<!--[-->');

											DatePicker.Calendar($$renderer, {
												'data-testid': 'calendar',
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
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
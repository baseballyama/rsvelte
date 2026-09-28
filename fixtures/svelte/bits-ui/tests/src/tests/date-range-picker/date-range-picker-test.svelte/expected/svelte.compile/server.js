import * as $ from 'svelte/internal/server';
import { DateRangePicker } from "bits-ui";

export default function Date_range_picker_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placeholder,
			value,
			open = false,
			startProps,
			endProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function clear() {
			value = { start: undefined, end: undefined };
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><div data-testid="value">${$.escape(value)}</div> <div data-testid="open">${$.escape(open)}</div> <div data-testid="start-value">${$.escape(String(value?.start))}</div> <div data-testid="end-value">${$.escape(String(value?.end))}</div> <button>clear</button> <button>toggle open</button> `);

			if (DateRangePicker.Root) {
				$$renderer.push('<!--[-->');

				DateRangePicker.Root($$renderer, $.spread_props([
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
							if (DateRangePicker.Label) {
								$$renderer.push('<!--[-->');

								DateRangePicker.Label($$renderer, {
									'data-testid': 'label',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Rental Days`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like(["start", "end"]);

							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let type = each_array[$$index_1];
								const inputProps = type === "start" ? startProps : endProps;

								{
									function children($$renderer, { segments }) {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(segments);

										for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
											let { part, value } = each_array_1[i];

											if (DateRangePicker.Segment) {
												$$renderer.push('<!--[-->');

												DateRangePicker.Segment($$renderer, {
													part,
													'data-testid': part === "literal" ? undefined : `${type}-${part}`,
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

									if (DateRangePicker.Input) {
										$$renderer.push('<!--[-->');

										DateRangePicker.Input($$renderer, $.spread_props([
											{ type, 'data-testid': `${$.stringify(type)}-input` },
											inputProps,
											{ children, $$slots: { default: true } }
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							}

							$$renderer.push(`<!--]--> `);

							if (DateRangePicker.Trigger) {
								$$renderer.push('<!--[-->');

								DateRangePicker.Trigger($$renderer, {
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

							if (DateRangePicker.Content) {
								$$renderer.push('<!--[-->');

								DateRangePicker.Content($$renderer, {
									'data-testid': 'content',
									children: ($$renderer) => {
										{
											function children($$renderer, { months, weekdays }) {
												if (DateRangePicker.Header) {
													$$renderer.push('<!--[-->');

													DateRangePicker.Header($$renderer, {
														'data-testid': 'header',
														children: ($$renderer) => {
															if (DateRangePicker.PrevButton) {
																$$renderer.push('<!--[-->');

																DateRangePicker.PrevButton($$renderer, {
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

															if (DateRangePicker.Heading) {
																$$renderer.push('<!--[-->');
																DateRangePicker.Heading($$renderer, { 'data-testid': 'heading' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DateRangePicker.NextButton) {
																$$renderer.push('<!--[-->');

																DateRangePicker.NextButton($$renderer, {
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

												const each_array_2 = $.ensure_array_like(months);

												for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
													let month = each_array_2[i];
													const m = month.value.month;

													if (DateRangePicker.Grid) {
														$$renderer.push('<!--[-->');

														DateRangePicker.Grid($$renderer, {
															'data-testid': `grid-${$.stringify(m)}`,
															children: ($$renderer) => {
																if (DateRangePicker.GridHead) {
																	$$renderer.push('<!--[-->');

																	DateRangePicker.GridHead($$renderer, {
																		'data-testid': `grid-head-${$.stringify(m)}`,
																		children: ($$renderer) => {
																			if (DateRangePicker.GridRow) {
																				$$renderer.push('<!--[-->');

																				DateRangePicker.GridRow($$renderer, {
																					'data-testid': `grid-row-${$.stringify(m)}`,
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array_3 = $.ensure_array_like(weekdays);

																						for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
																							let day = each_array_3[i];

																							if (DateRangePicker.HeadCell) {
																								$$renderer.push('<!--[-->');

																								DateRangePicker.HeadCell($$renderer, {
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

																if (DateRangePicker.GridBody) {
																	$$renderer.push('<!--[-->');

																	DateRangePicker.GridBody($$renderer, {
																		'data-testid': `grid-body-${$.stringify(m)}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_4 = $.ensure_array_like(month.weeks);

																			for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
																				let weekDates = each_array_4[i];

																				if (DateRangePicker.GridRow) {
																					$$renderer.push('<!--[-->');

																					DateRangePicker.GridRow($$renderer, {
																						'data-testid': `grid-row-${$.stringify(m)}-${$.stringify(i)}`,
																						'data-week': true,
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array_5 = $.ensure_array_like(weekDates);

																							for (let d = 0, $$length = each_array_5.length; d < $$length; d++) {
																								let date = each_array_5[d];

																								if (DateRangePicker.Cell) {
																									$$renderer.push('<!--[-->');

																									DateRangePicker.Cell($$renderer, {
																										date,
																										month: month.value,
																										'data-testid': `cell-${$.stringify(date.month)}-${$.stringify(d)}`,
																										class: 'p-3',
																										children: ($$renderer) => {
																											if (DateRangePicker.Day) {
																												$$renderer.push('<!--[-->');

																												DateRangePicker.Day($$renderer, {
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

											if (DateRangePicker.Calendar) {
												$$renderer.push('<!--[-->');

												DateRangePicker.Calendar($$renderer, {
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
	});
}
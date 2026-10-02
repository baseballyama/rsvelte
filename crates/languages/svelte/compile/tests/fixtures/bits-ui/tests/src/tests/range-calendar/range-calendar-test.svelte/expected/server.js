import * as $ from 'svelte/internal/server';
import { RangeCalendar } from "bits-ui";

export default function Range_calendar_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { placeholder, value, $$slots, $$events, ...restProps } = $$props;

		function clear() {
			value = { start: undefined, end: undefined };
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><div data-testid="start-value">${$.escape(String(value?.start))}</div> <div data-testid="end-value">${$.escape(String(value?.end))}</div> `);

			{
				function children($$renderer, { months, weekdays }) {
					if (RangeCalendar.Header) {
						$$renderer.push('<!--[-->');

						RangeCalendar.Header($$renderer, {
							'data-testid': 'header',
							children: ($$renderer) => {
								if (RangeCalendar.PrevButton) {
									$$renderer.push('<!--[-->');

									RangeCalendar.PrevButton($$renderer, {
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

								if (RangeCalendar.Heading) {
									$$renderer.push('<!--[-->');
									RangeCalendar.Heading($$renderer, { 'data-testid': 'heading' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (RangeCalendar.NextButton) {
									$$renderer.push('<!--[-->');

									RangeCalendar.NextButton($$renderer, {
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

					const each_array = $.ensure_array_like(months);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let month = each_array[i];
						const m = month.value.month;

						if (RangeCalendar.Grid) {
							$$renderer.push('<!--[-->');

							RangeCalendar.Grid($$renderer, {
								'data-testid': `grid-${$.stringify(m)}`,
								children: ($$renderer) => {
									if (RangeCalendar.GridHead) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridHead($$renderer, {
											'data-testid': `grid-head-${$.stringify(m)}`,
											children: ($$renderer) => {
												if (RangeCalendar.GridRow) {
													$$renderer.push('<!--[-->');

													RangeCalendar.GridRow($$renderer, {
														'data-testid': `grid-row-${$.stringify(m)}`,
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(weekdays);

															for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																let day = each_array_1[i];

																if (RangeCalendar.HeadCell) {
																	$$renderer.push('<!--[-->');

																	RangeCalendar.HeadCell($$renderer, {
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

									if (RangeCalendar.GridBody) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridBody($$renderer, {
											'data-testid': `grid-body-${$.stringify(m)}`,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like(month.weeks);

												for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
													let weekDates = each_array_2[i];

													if (RangeCalendar.GridRow) {
														$$renderer.push('<!--[-->');

														RangeCalendar.GridRow($$renderer, {
															'data-testid': `grid-row-${$.stringify(m)}-${$.stringify(i)}`,
															'data-week': true,
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_3 = $.ensure_array_like(weekDates);

																for (let d = 0, $$length = each_array_3.length; d < $$length; d++) {
																	let date = each_array_3[d];

																	if (RangeCalendar.Cell) {
																		$$renderer.push('<!--[-->');

																		RangeCalendar.Cell($$renderer, {
																			date,
																			month: month.value,
																			'data-testid': `cell-${$.stringify(date.month)}-${$.stringify(d)}`,
																			children: ($$renderer) => {
																				if (RangeCalendar.Day) {
																					$$renderer.push('<!--[-->');

																					RangeCalendar.Day($$renderer, {
																						'data-testid': `date-${$.stringify(date.month)}-${$.stringify(date.day)}`,
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

				if (RangeCalendar.Root) {
					$$renderer.push('<!--[-->');

					RangeCalendar.Root($$renderer, $.spread_props([
						restProps,
						{
							'data-testid': 'calendar',
							get placeholder() {
								return placeholder;
							},

							set placeholder($$value) {
								placeholder = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(` <button>clear</button></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
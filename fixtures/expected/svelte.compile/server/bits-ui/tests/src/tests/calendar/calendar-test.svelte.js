import * as $ from 'svelte/internal/server';
import { CalendarDateTime, ZonedDateTime } from "@internationalized/date";
import { Calendar } from "bits-ui";

export default function Calendar_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placeholder,
			value,
			type: _type = "single",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function changeValue(field) {
			if (value) {
				value = value.cycle(field, 1);
			} else if (placeholder) {
				placeholder = placeholder.cycle(field, 1);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><div data-testid="value">${$.escape(String(value?.toString()))}</div> `);

			{
				function children($$renderer, { months, weekdays }) {
					if (Calendar.Header) {
						$$renderer.push('<!--[-->');

						Calendar.Header($$renderer, {
							'data-testid': 'header',
							children: ($$renderer) => {
								if (Calendar.PrevButton) {
									$$renderer.push('<!--[-->');

									Calendar.PrevButton($$renderer, {
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

								if (Calendar.Heading) {
									$$renderer.push('<!--[-->');
									Calendar.Heading($$renderer, { 'data-testid': 'heading' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Calendar.NextButton) {
									$$renderer.push('<!--[-->');

									Calendar.NextButton($$renderer, {
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

						if (Calendar.Grid) {
							$$renderer.push('<!--[-->');

							Calendar.Grid($$renderer, {
								'data-testid': `grid-${$.stringify(m)}`,
								children: ($$renderer) => {
									if (Calendar.GridHead) {
										$$renderer.push('<!--[-->');

										Calendar.GridHead($$renderer, {
											'data-testid': `grid-head-${$.stringify(m)}`,
											children: ($$renderer) => {
												if (Calendar.GridRow) {
													$$renderer.push('<!--[-->');

													Calendar.GridRow($$renderer, {
														'data-testid': `grid-row-${$.stringify(m)}`,
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(weekdays);

															for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																let day = each_array_1[i];

																if (Calendar.HeadCell) {
																	$$renderer.push('<!--[-->');

																	Calendar.HeadCell($$renderer, {
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

									if (Calendar.GridBody) {
										$$renderer.push('<!--[-->');

										Calendar.GridBody($$renderer, {
											'data-testid': `grid-body-${$.stringify(m)}`,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like(month.weeks);

												for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
													let weekDates = each_array_2[i];

													if (Calendar.GridRow) {
														$$renderer.push('<!--[-->');

														Calendar.GridRow($$renderer, {
															'data-testid': `grid-row-${$.stringify(m)}-${$.stringify(i)}`,
															'data-week': true,
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_3 = $.ensure_array_like(weekDates);

																for (let d = 0, $$length = each_array_3.length; d < $$length; d++) {
																	let date = each_array_3[d];

																	if (Calendar.Cell) {
																		$$renderer.push('<!--[-->');

																		Calendar.Cell($$renderer, {
																			date,
																			month: month.value,
																			'data-testid': `cell-${$.stringify(date.month)}-${$.stringify(d)}`,
																			children: ($$renderer) => {
																				if (Calendar.Day) {
																					$$renderer.push('<!--[-->');

																					Calendar.Day($$renderer, {
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

				if (Calendar.Root) {
					$$renderer.push('<!--[-->');

					Calendar.Root($$renderer, $.spread_props([
						{ type: 'single' },
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

			$$renderer.push(` <button data-testid="add-day">Add Day</button> <button data-testid="add-month">Add Month</button> <button data-testid="add-year">Add Year</button> <button data-testid="set-time">Set time</button></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
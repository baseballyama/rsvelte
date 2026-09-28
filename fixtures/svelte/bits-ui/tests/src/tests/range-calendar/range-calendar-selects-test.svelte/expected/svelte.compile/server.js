import * as $ from 'svelte/internal/server';
import { RangeCalendar } from "bits-ui";

export default function Range_calendar_selects_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			placeholder,
			value = void 0,
			months,
			years,
			monthFormat,
			yearFormat,
			disabled = false,
			readonly = false,
			minValue,
			maxValue
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months: calendarMonths }) {
					$$renderer.push(`<div data-testid="header">`);

					if (RangeCalendar.MonthSelect) {
						$$renderer.push('<!--[-->');
						RangeCalendar.MonthSelect($$renderer, { 'data-testid': 'month-select', months, monthFormat });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (RangeCalendar.YearSelect) {
						$$renderer.push('<!--[-->');
						RangeCalendar.YearSelect($$renderer, { 'data-testid': 'year-select', years, yearFormat });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div data-testid="calendar-grid"><!--[-->`);

					const each_array = $.ensure_array_like(calendarMonths);

					for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
						let month = each_array[$$index_2];

						if (RangeCalendar.Grid) {
							$$renderer.push('<!--[-->');

							RangeCalendar.Grid($$renderer, {
								'data-testid': `grid-${$.stringify(month.value.month)}`,
								children: ($$renderer) => {
									if (RangeCalendar.GridHead) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridHead($$renderer, {
											children: ($$renderer) => {
												if (RangeCalendar.GridRow) {
													$$renderer.push('<!--[-->');

													RangeCalendar.GridRow($$renderer, {
														children: ($$renderer) => {
															if (RangeCalendar.HeadCell) {
																$$renderer.push('<!--[-->');

																RangeCalendar.HeadCell($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Day`);
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

									if (RangeCalendar.GridBody) {
										$$renderer.push('<!--[-->');

										RangeCalendar.GridBody($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_1 = $.ensure_array_like(month.weeks);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let weekDates = each_array_1[$$index_1];

													if (RangeCalendar.GridRow) {
														$$renderer.push('<!--[-->');

														RangeCalendar.GridRow($$renderer, {
															'data-week': true,
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array_2 = $.ensure_array_like(weekDates);

																for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
																	let date = each_array_2[$$index];

																	if (RangeCalendar.Cell) {
																		$$renderer.push('<!--[-->');

																		RangeCalendar.Cell($$renderer, {
																			date,
																			month: month.value,
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

					RangeCalendar.Root($$renderer, {
						placeholder,
						disabled,
						readonly,
						minValue,
						maxValue,
						'data-testid': 'calendar',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}
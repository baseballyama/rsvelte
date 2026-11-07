import * as $ from 'svelte/internal/server';
import { Calendar } from "bits-ui";

export default function Calendar_selects_test($$renderer, $$props) {
	let {
		placeholder,
		months,
		years,
		monthFormat,
		yearFormat,
		disabled = false,
		readonly = false,
		minValue,
		maxValue
	} = $$props;

	{
		function children($$renderer, { months: calendarMonths }) {
			$$renderer.push(`<div data-testid="header">`);

			if (Calendar.MonthSelect) {
				$$renderer.push('<!--[-->');
				Calendar.MonthSelect($$renderer, { 'data-testid': 'month-select', months, monthFormat });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Calendar.YearSelect) {
				$$renderer.push('<!--[-->');
				Calendar.YearSelect($$renderer, { 'data-testid': 'year-select', years, yearFormat });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div data-testid="calendar-grid"><!--[-->`);

			const each_array = $.ensure_array_like(calendarMonths);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let month = each_array[i];

				if (Calendar.Grid) {
					$$renderer.push('<!--[-->');

					Calendar.Grid($$renderer, {
						'data-testid': `grid-${$.stringify(month.value.month)}`,
						children: ($$renderer) => {
							if (Calendar.GridHead) {
								$$renderer.push('<!--[-->');

								Calendar.GridHead($$renderer, {
									children: ($$renderer) => {
										if (Calendar.GridRow) {
											$$renderer.push('<!--[-->');

											Calendar.GridRow($$renderer, {
												children: ($$renderer) => {
													if (Calendar.HeadCell) {
														$$renderer.push('<!--[-->');

														Calendar.HeadCell($$renderer, {
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

							if (Calendar.GridBody) {
								$$renderer.push('<!--[-->');

								Calendar.GridBody($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(month.weeks);

										for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
											let weekDates = each_array_1[j];

											if (Calendar.GridRow) {
												$$renderer.push('<!--[-->');

												Calendar.GridRow($$renderer, {
													'data-week': true,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_2 = $.ensure_array_like(weekDates);

														for (let k = 0, $$length = each_array_2.length; k < $$length; k++) {
															let date = each_array_2[k];

															if (Calendar.Cell) {
																$$renderer.push('<!--[-->');

																Calendar.Cell($$renderer, {
																	date,
																	month: month.value,
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

			Calendar.Root($$renderer, {
				type: 'single',
				placeholder,
				disabled,
				readonly,
				minValue,
				maxValue,
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
}
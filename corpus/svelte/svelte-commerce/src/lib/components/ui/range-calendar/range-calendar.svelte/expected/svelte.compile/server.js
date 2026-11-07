import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import * as RangeCalendar from './index';
import { cn } from '$lib/core/utils';

export default function Range_calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			placeholder = void 0,
			class: className,
			weekdayFormat = 'short',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (RangeCalendar.Header) {
						$$renderer.push('<!--[-->');

						RangeCalendar.Header($$renderer, {
							children: ($$renderer) => {
								if (RangeCalendar.PrevButton) {
									$$renderer.push('<!--[-->');
									RangeCalendar.PrevButton($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (RangeCalendar.Heading) {
									$$renderer.push('<!--[-->');
									RangeCalendar.Heading($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (RangeCalendar.NextButton) {
									$$renderer.push('<!--[-->');
									RangeCalendar.NextButton($$renderer, {});
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

					if (RangeCalendar.Months) {
						$$renderer.push('<!--[-->');

						RangeCalendar.Months($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(months);

								for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
									let month = each_array[$$index_3];

									if (RangeCalendar.Grid) {
										$$renderer.push('<!--[-->');

										RangeCalendar.Grid($$renderer, {
											children: ($$renderer) => {
												if (RangeCalendar.GridHead) {
													$$renderer.push('<!--[-->');

													RangeCalendar.GridHead($$renderer, {
														children: ($$renderer) => {
															if (RangeCalendar.GridRow) {
																$$renderer.push('<!--[-->');

																RangeCalendar.GridRow($$renderer, {
																	class: 'flex',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_1 = $.ensure_array_like(weekdays);

																		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																			let weekday = each_array_1[$$index];

																			if (RangeCalendar.HeadCell) {
																				$$renderer.push('<!--[-->');

																				RangeCalendar.HeadCell($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(weekday.slice(0, 2))}`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_2 = $.ensure_array_like(month.weeks);

															for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																let weekDates = each_array_2[$$index_2];

																if (RangeCalendar.GridRow) {
																	$$renderer.push('<!--[-->');

																	RangeCalendar.GridRow($$renderer, {
																		class: 'mt-2 w-full',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_3 = $.ensure_array_like(weekDates);

																			for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
																				let date = each_array_3[$$index_1];

																				if (RangeCalendar.Cell) {
																					$$renderer.push('<!--[-->');

																					RangeCalendar.Cell($$renderer, {
																						date,
																						month: month.value,
																						children: ($$renderer) => {
																							if (RangeCalendar.Day) {
																								$$renderer.push('<!--[-->');
																								RangeCalendar.Day($$renderer, {});
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

				if (RangeCalendarPrimitive.Root) {
					$$renderer.push('<!--[-->');

					RangeCalendarPrimitive.Root($$renderer, $.spread_props([
						{ weekdayFormat, class: cn('p-3', className) },
						restProps,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},

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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value, placeholder });
	});
}
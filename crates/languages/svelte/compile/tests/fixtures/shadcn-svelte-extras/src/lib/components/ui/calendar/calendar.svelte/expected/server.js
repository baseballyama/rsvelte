import * as $ from 'svelte/internal/server';
import { Calendar as CalendarPrimitive } from 'bits-ui';
import * as Calendar from './index.js';
import { cn } from '$lib/utils.js';
import { isEqualMonth } from '@internationalized/date';

export default function Calendar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			placeholder = void 0,
			class: className,
			weekdayFormat = 'short',
			buttonVariant = 'ghost',
			captionLayout = 'label',
			locale = 'en-US',
			months: monthsProp,
			years,
			monthFormat: monthFormatProp,
			yearFormat = 'numeric',
			day,
			disableDaysOutsideMonth = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const monthFormat = $.derived(() => {
			if (monthFormatProp) return monthFormatProp;
			if (captionLayout.startsWith('dropdown')) return 'short';

			return 'long';
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (Calendar.Months) {
						$$renderer.push('<!--[-->');

						Calendar.Months($$renderer, {
							children: ($$renderer) => {
								if (Calendar.Nav) {
									$$renderer.push('<!--[-->');

									Calendar.Nav($$renderer, {
										children: ($$renderer) => {
											if (Calendar.PrevButton) {
												$$renderer.push('<!--[-->');
												Calendar.PrevButton($$renderer, { variant: buttonVariant });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Calendar.NextButton) {
												$$renderer.push('<!--[-->');
												Calendar.NextButton($$renderer, { variant: buttonVariant });
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

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(months);

								for (let monthIndex = 0, $$length = each_array.length; monthIndex < $$length; monthIndex++) {
									let month = each_array[monthIndex];

									if (Calendar.Month) {
										$$renderer.push('<!--[-->');

										Calendar.Month($$renderer, {
											children: ($$renderer) => {
												if (Calendar.Header) {
													$$renderer.push('<!--[-->');

													Calendar.Header($$renderer, {
														children: ($$renderer) => {
															if (Calendar.Caption) {
																$$renderer.push('<!--[-->');

																Calendar.Caption($$renderer, {
																	captionLayout,
																	months: monthsProp,
																	monthFormat: monthFormat(),
																	years,
																	yearFormat,
																	month: month.value,
																	locale,
																	monthIndex,
																	get placeholder() {
																		return placeholder;
																	},

																	set placeholder($$value) {
																		placeholder = $$value;
																		$$settled = false;
																	}
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

												if (Calendar.Grid) {
													$$renderer.push('<!--[-->');

													Calendar.Grid($$renderer, {
														children: ($$renderer) => {
															if (Calendar.GridHead) {
																$$renderer.push('<!--[-->');

																Calendar.GridHead($$renderer, {
																	children: ($$renderer) => {
																		if (Calendar.GridRow) {
																			$$renderer.push('<!--[-->');

																			Calendar.GridRow($$renderer, {
																				class: 'select-none',
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_1 = $.ensure_array_like(weekdays);

																					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																						let weekday = each_array_1[$$index];

																						if (Calendar.HeadCell) {
																							$$renderer.push('<!--[-->');

																							Calendar.HeadCell($$renderer, {
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

															if (Calendar.GridBody) {
																$$renderer.push('<!--[-->');

																Calendar.GridBody($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_2 = $.ensure_array_like(month.weeks);

																		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																			let weekDates = each_array_2[$$index_2];

																			if (Calendar.GridRow) {
																				$$renderer.push('<!--[-->');

																				Calendar.GridRow($$renderer, {
																					class: 'mt-2 w-full',
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array_3 = $.ensure_array_like(weekDates);

																						for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
																							let date = each_array_3[$$index_1];

																							if (Calendar.Cell) {
																								$$renderer.push('<!--[-->');

																								Calendar.Cell($$renderer, {
																									date,
																									month: month.value,
																									children: ($$renderer) => {
																										if (day) {
																											$$renderer.push('<!--[0-->');
																											day($$renderer, { day: date, outsideMonth: !isEqualMonth(date, month.value) });
																											$$renderer.push(`<!---->`);
																										} else {
																											$$renderer.push('<!--[-1-->');

																											if (Calendar.Day) {
																												$$renderer.push('<!--[-->');
																												Calendar.Day($$renderer, {});
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

				if (CalendarPrimitive.Root) {
					$$renderer.push('<!--[-->');

					CalendarPrimitive.Root($$renderer, $.spread_props([
						{
							weekdayFormat,
							disableDaysOutsideMonth,
							class: cn('bg-background group/calendar p-3 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent', className),
							locale,
							monthFormat: monthFormat(),
							yearFormat
						},
						restProps,
						{
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
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
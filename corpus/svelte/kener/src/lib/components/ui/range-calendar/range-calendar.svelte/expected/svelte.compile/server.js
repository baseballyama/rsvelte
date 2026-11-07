import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import * as RangeCalendar from "./index.js";
import { cn } from "$lib/utils.js";
import { isEqualMonth } from "@internationalized/date";

export default function Range_calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			placeholder = void 0,
			weekdayFormat = "short",
			class: className,
			buttonVariant = "ghost",
			captionLayout = "label",
			locale = "en-US",
			months: monthsProp,
			years,
			monthFormat: monthFormatProp,
			yearFormat = "numeric",
			day,
			disableDaysOutsideMonth = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const monthFormat = $.derived(() => {
			if (monthFormatProp) return monthFormatProp;
			if (captionLayout.startsWith("dropdown")) return "short";

			return "long";
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { months, weekdays }) {
					if (RangeCalendar.Months) {
						$$renderer.push('<!--[-->');

						RangeCalendar.Months($$renderer, {
							children: ($$renderer) => {
								if (RangeCalendar.Nav) {
									$$renderer.push('<!--[-->');

									RangeCalendar.Nav($$renderer, {
										children: ($$renderer) => {
											if (RangeCalendar.PrevButton) {
												$$renderer.push('<!--[-->');
												RangeCalendar.PrevButton($$renderer, { variant: buttonVariant });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (RangeCalendar.NextButton) {
												$$renderer.push('<!--[-->');
												RangeCalendar.NextButton($$renderer, { variant: buttonVariant });
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

									if (RangeCalendar.Month) {
										$$renderer.push('<!--[-->');

										RangeCalendar.Month($$renderer, {
											children: ($$renderer) => {
												if (RangeCalendar.Header) {
													$$renderer.push('<!--[-->');

													RangeCalendar.Header($$renderer, {
														children: ($$renderer) => {
															if (RangeCalendar.Caption) {
																$$renderer.push('<!--[-->');

																RangeCalendar.Caption($$renderer, {
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
																				class: 'select-none',
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
																										if (day) {
																											$$renderer.push('<!--[0-->');
																											day($$renderer, { day: date, outsideMonth: !isEqualMonth(date, month.value) });
																											$$renderer.push(`<!---->`);
																										} else {
																											$$renderer.push('<!--[-1-->');

																											if (RangeCalendar.Day) {
																												$$renderer.push('<!--[-->');
																												RangeCalendar.Day($$renderer, {});
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

				if (RangeCalendarPrimitive.Root) {
					$$renderer.push('<!--[-->');

					RangeCalendarPrimitive.Root($$renderer, $.spread_props([
						{
							weekdayFormat,
							disableDaysOutsideMonth,
							class: cn("bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent", className),
							locale,
							monthFormat: monthFormat(),
							yearFormat
						},
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
import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import { cn } from '$lib/utils.js';
import { getLocalTimeZone, isWeekend, today } from '@internationalized/date';
import Calendar from '@lucide/svelte/icons/calendar';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { DateRangePicker } from 'bits-ui';

export default function Input_43($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let now = today(getLocalTimeZone());
		let value = { end: undefined, start: undefined };
		let locale = useLocale();

		// Define disabled date ranges
		const disabledRanges = [
			[now, now.add({ days: 5 })],
			[now.add({ days: 14 }), now.add({ days: 16 })],
			[now.add({ days: 23 }), now.add({ days: 24 })]
		];

		// Check if a date is unavailable
		function isDateUnavailable(date) {
			return isWeekend(date, locale.locale) || disabledRanges.some((interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0);
		}

		// Validate the selected range
		const validate = (value) => {
			if (!value?.start || !value?.end) return;

			const hasOverlap = disabledRanges.some((interval) => {
				const rangeEnd = value.end.compare(interval[0]) >= 0;
				const rangeStart = value.start.compare(interval[1]) <= 0;

				return rangeEnd && rangeStart;
			});

			if (!hasOverlap) return;

			return 'Selected date range may not include unavailable dates.';
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DateRangePicker.Root) {
				$$renderer.push('<!--[-->');

				DateRangePicker.Root($$renderer, {
					locale: locale.locale,
					minValue: now,
					validate,
					isDateUnavailable,
					weekdayFormat: 'short',
					fixedWeeks: true,
					class: '*:not-first:mt-2',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Label($$renderer, {
							class: 'text-foreground text-sm font-medium',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Date range picker (unavailable dates)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="flex"><div class="border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 pe-9 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50"><!--[-->`);

						const each_array = $.ensure_array_like(['start', 'end']);

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let type = each_array[$$index_1];

							{
								function children($$renderer, { segments }) {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(segments);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let { part, value } = each_array_1[$$index];

										if (DateRangePicker.Segment) {
											$$renderer.push('<!--[-->');

											DateRangePicker.Segment($$renderer, {
												part,
												class: [
													'text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
													'data-[segment=literal]:text-muted-foreground/70  data-[segment=literal]:px-0'
												],

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
									DateRangePicker.Input($$renderer, { type, children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (type === 'start') {
								$$renderer.push(`<!--[0--><span aria-hidden="true" class="text-muted-foreground/70 px-2">-</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div> `);

						if (DateRangePicker.Trigger) {
							$$renderer.push('<!--[-->');

							DateRangePicker.Trigger($$renderer, {
								class: 'text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/30 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:outline-hidden data-focus-visible:border data-focus-visible:ring-2 data-focus-visible:ring-offset-2',
								children: ($$renderer) => {
									Calendar($$renderer, { size: 16 });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						if (DateRangePicker.Content) {
							$$renderer.push('<!--[-->');

							DateRangePicker.Content($$renderer, {
								class: 'border-input bg-background text-foreground z-50 rounded-lg border shadow-lg shadow-black/[.04] outline-hidden',
								children: ($$renderer) => {
									{
										function children($$renderer, { months, weekdays }) {
											if (DateRangePicker.Header) {
												$$renderer.push('<!--[-->');

												DateRangePicker.Header($$renderer, {
													class: 'flex w-full items-center gap-1 pb-1',
													children: ($$renderer) => {
														if (DateRangePicker.PrevButton) {
															$$renderer.push('<!--[-->');

															DateRangePicker.PrevButton($$renderer, {
																class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
																children: ($$renderer) => {
																	ChevronLeft($$renderer, { size: 16 });
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
															DateRangePicker.Heading($$renderer, { class: 'grow text-center text-sm font-medium' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (DateRangePicker.NextButton) {
															$$renderer.push('<!--[-->');

															DateRangePicker.NextButton($$renderer, {
																class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
																children: ($$renderer) => {
																	ChevronRight($$renderer, { size: 16 });
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

											$$renderer.push(` <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4"><!--[-->`);

											const each_array_2 = $.ensure_array_like(months);

											for (let $$index_5 = 0, $$length = each_array_2.length; $$index_5 < $$length; $$index_5++) {
												let month = each_array_2[$$index_5];

												if (DateRangePicker.Grid) {
													$$renderer.push('<!--[-->');

													DateRangePicker.Grid($$renderer, {
														class: 'w-fit border-collapse space-y-1 select-none',
														children: ($$renderer) => {
															if (DateRangePicker.GridHead) {
																$$renderer.push('<!--[-->');

																DateRangePicker.GridHead($$renderer, {
																	children: ($$renderer) => {
																		if (DateRangePicker.GridRow) {
																			$$renderer.push('<!--[-->');

																			DateRangePicker.GridRow($$renderer, {
																				class: 'flex w-full justify-between',
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_3 = $.ensure_array_like(weekdays);

																					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																						let day = each_array_3[$$index_2];

																						if (DateRangePicker.HeadCell) {
																							$$renderer.push('<!--[-->');

																							DateRangePicker.HeadCell($$renderer, {
																								class: 'text-muted-foreground/80 size-9 rounded-lg p-0 text-xs font-medium',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(day.slice(0, 2))}`);
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
																	class: '[&_td]:px-0',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_4 = $.ensure_array_like(month.weeks);

																		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																			let weekDates = each_array_4[$$index_4];

																			if (DateRangePicker.GridRow) {
																				$$renderer.push('<!--[-->');

																				DateRangePicker.GridRow($$renderer, {
																					class: 'flex w-full',
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array_5 = $.ensure_array_like(weekDates);

																						for (let $$index_3 = 0, $$length = each_array_5.length; $$index_3 < $$length; $$index_3++) {
																							let date = each_array_5[$$index_3];

																							if (DateRangePicker.Cell) {
																								$$renderer.push('<!--[-->');

																								DateRangePicker.Cell($$renderer, {
																									date,
																									month: month.value,
																									class: cn('text-foreground ring-offset-background data-focus-visible:border-ring hover:bg-accent data-selected:bg-accent hover:text-foreground data-selected:text-foreground data-focus-visible:ring-ring/30 data-invalid:data-selection-end:[&:not([data-hover])]:bg-destructive data-invalid:data-selection-start:[&:not([data-hover])]:bg-destructive data-selection-end:[&:not([data-hover])]:bg-primary data-selection-start:[&:not([data-hover])]:bg-primary data-invalid:data-selection-end:[&:not([data-hover])]:text-destructive-foreground data-invalid:data-selection-start:[&:not([data-hover])]:text-destructive-foreground data-selection-end:[&:not([data-hover])]:text-primary-foreground data-selection-start:[&:not([data-hover])]:text-primary-foreground relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-30 data-focus-visible:z-10 data-focus-visible:ring-2 data-focus-visible:ring-offset-2 data-focus-visible:outline-hidden data-invalid:bg-red-100 data-selected:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg data-unavailable:pointer-events-none data-unavailable:line-through data-unavailable:opacity-30', date.compare(now) === 0 && 'after:bg-primary data-selection-end:[&:not([data-hover])]:after:bg-background data-selection-start:[&:not([data-hover])]:after:bg-background after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full'),
																									children: ($$renderer) => {
																										if (DateRangePicker.Day) {
																											$$renderer.push('<!--[-->');

																											DateRangePicker.Day($$renderer, {
																												class: cn('text-foreground ring-offset-background relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150', 'disabled:pointer-events-none data-outside-month:pointer-events-none', 'data-highlighted:bg-accent data-selected:bg-accent', 'data-selection-end:bg-primary data-selection-start:bg-primary', 'data-selection-end:text-primary-foreground data-selection-start:text-primary-foreground', 'data-highlighted:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg', 'focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'),
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
											DateRangePicker.Calendar($$renderer, { class: 'w-fit p-2', children, $$slots: { default: true } });
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

						$$renderer.push(` <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/date-range-picker" target="_blank" rel="noopener nofollow">Bits UI</a></p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
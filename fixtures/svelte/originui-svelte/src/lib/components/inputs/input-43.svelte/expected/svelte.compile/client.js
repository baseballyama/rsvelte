import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import { cn } from '$lib/utils.js';
import { getLocalTimeZone, isWeekend, today } from '@internationalized/date';
import Calendar from '@lucide/svelte/icons/calendar';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { DateRangePicker } from 'bits-ui';

var root = $.from_html(`<span aria-hidden="true" class="text-muted-foreground/70 px-2">-</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4"></div>`, 1);
var root_4 = $.from_html(`<!> <div class="flex"><div class="border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 pe-9 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50"></div> <!></div> <!> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/date-range-picker" target="_blank" rel="noopener nofollow">Bits UI</a></p>`, 1);

export default function Input_43($$anchor, $$props) {
	$.push($$props, true);

	let now = today(getLocalTimeZone());
	let value = $.state($.proxy({ end: undefined, start: undefined }));
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DateRangePicker.Root, ($$anchor, DateRangePicker_Root) => {
		DateRangePicker_Root($$anchor, {
			get locale() {
				return locale.locale;
			},

			get minValue() {
				return now;
			},
			validate,
			isDateUnavailable,
			weekdayFormat: 'short',
			fixedWeeks: true,
			class: '*:not-first:mt-2',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					class: 'text-foreground text-sm font-medium',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Date range picker (unavailable dates)');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div = $.sibling(node_1, 2);
				var div_1 = $.child(div);

				$.each(div_1, 20, () => ['start', 'end'], (type) => type, ($$anchor, type) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let segments = () => ($$arg0?.()).segments;
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 17, segments, $.index, ($$anchor, $$item, $$index, $$array) => {
								let part = () => $.get($$item).part;
								let value = () => $.get($$item).value;
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => DateRangePicker.Segment, ($$anchor, DateRangePicker_Segment) => {
									DateRangePicker_Segment($$anchor, {
										get part() {
											return part();
										},

										class: [
											'text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
											'data-[segment=literal]:text-muted-foreground/70  data-[segment=literal]:px-0'
										],

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, value()));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						};

						$.component(node_2, () => DateRangePicker.Input, ($$anchor, DateRangePicker_Input) => {
							DateRangePicker_Input($$anchor, {
								get type() {
									return type;
								},
								children,
								$$slots: { default: true }
							});
						});
					}

					var node_5 = $.sibling(node_2, 2);

					{
						var consequent = ($$anchor) => {
							var span = root();

							$.append($$anchor, span);
						};

						$.if(node_5, ($$render) => {
							if (type === 'start') $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.reset(div_1);

				var node_6 = $.sibling(div_1, 2);

				$.component(node_6, () => DateRangePicker.Trigger, ($$anchor, DateRangePicker_Trigger) => {
					DateRangePicker_Trigger($$anchor, {
						class: 'text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/30 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:outline-hidden data-focus-visible:border data-focus-visible:ring-2 data-focus-visible:ring-offset-2',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, { size: 16 });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_7 = $.sibling(div, 2);

				$.component(node_7, () => DateRangePicker.Content, ($$anchor, DateRangePicker_Content) => {
					DateRangePicker_Content($$anchor, {
						class: 'border-input bg-background text-foreground z-50 rounded-lg border shadow-lg shadow-black/[.04] outline-hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_8 = $.first_child(fragment_7);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_8 = root_3();
									var node_9 = $.first_child(fragment_8);

									$.component(node_9, () => DateRangePicker.Header, ($$anchor, DateRangePicker_Header) => {
										DateRangePicker_Header($$anchor, {
											class: 'flex w-full items-center gap-1 pb-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_2();
												var node_10 = $.first_child(fragment_9);

												$.component(node_10, () => DateRangePicker.PrevButton, ($$anchor, DateRangePicker_PrevButton) => {
													DateRangePicker_PrevButton($$anchor, {
														class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
														children: ($$anchor, $$slotProps) => {
															ChevronLeft($$anchor, { size: 16 });
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => DateRangePicker.Heading, ($$anchor, DateRangePicker_Heading) => {
													DateRangePicker_Heading($$anchor, { class: 'grow text-center text-sm font-medium' });
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => DateRangePicker.NextButton, ($$anchor, DateRangePicker_NextButton) => {
													DateRangePicker_NextButton($$anchor, {
														class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
														children: ($$anchor, $$slotProps) => {
															ChevronRight($$anchor, { size: 16 });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var div_2 = $.sibling(node_9, 2);

									$.each(div_2, 21, months, (month) => month.value, ($$anchor, month) => {
										var fragment_12 = $.comment();
										var node_13 = $.first_child(fragment_12);

										$.component(node_13, () => DateRangePicker.Grid, ($$anchor, DateRangePicker_Grid) => {
											DateRangePicker_Grid($$anchor, {
												class: 'w-fit border-collapse space-y-1 select-none',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_1();
													var node_14 = $.first_child(fragment_13);

													$.component(node_14, () => DateRangePicker.GridHead, ($$anchor, DateRangePicker_GridHead) => {
														DateRangePicker_GridHead($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_15 = $.first_child(fragment_14);

																$.component(node_15, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow) => {
																	DateRangePicker_GridRow($$anchor, {
																		class: 'flex w-full justify-between',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = $.comment();
																			var node_16 = $.first_child(fragment_15);

																			$.each(node_16, 16, weekdays, (day) => day, ($$anchor, day) => {
																				var fragment_16 = $.comment();
																				var node_17 = $.first_child(fragment_16);

																				$.component(node_17, () => DateRangePicker.HeadCell, ($$anchor, DateRangePicker_HeadCell) => {
																					DateRangePicker_HeadCell($$anchor, {
																						class: 'text-muted-foreground/80 size-9 rounded-lg p-0 text-xs font-medium',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_2 = $.text();

																							$.template_effect(($0) => $.set_text(text_2, $0), [() => day.slice(0, 2)]);
																							$.append($$anchor, text_2);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_16);
																			});

																			$.append($$anchor, fragment_15);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													var node_18 = $.sibling(node_14, 2);

													$.component(node_18, () => DateRangePicker.GridBody, ($$anchor, DateRangePicker_GridBody) => {
														DateRangePicker_GridBody($$anchor, {
															class: '[&_td]:px-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = $.comment();
																var node_19 = $.first_child(fragment_18);

																$.each(node_19, 17, () => $.get(month).weeks, (weekDates) => weekDates.join('-'), ($$anchor, weekDates) => {
																	var fragment_19 = $.comment();
																	var node_20 = $.first_child(fragment_19);

																	$.component(node_20, () => DateRangePicker.GridRow, ($$anchor, DateRangePicker_GridRow_1) => {
																		DateRangePicker_GridRow_1($$anchor, {
																			class: 'flex w-full',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_20 = $.comment();
																				var node_21 = $.first_child(fragment_20);

																				$.each(node_21, 17, () => $.get(weekDates), (date) => date.day, ($$anchor, date) => {
																					var fragment_21 = $.comment();
																					var node_22 = $.first_child(fragment_21);

																					{
																						let $0 = $.derived(() => cn('text-foreground ring-offset-background data-focus-visible:border-ring hover:bg-accent data-selected:bg-accent hover:text-foreground data-selected:text-foreground data-focus-visible:ring-ring/30 data-invalid:data-selection-end:[&:not([data-hover])]:bg-destructive data-invalid:data-selection-start:[&:not([data-hover])]:bg-destructive data-selection-end:[&:not([data-hover])]:bg-primary data-selection-start:[&:not([data-hover])]:bg-primary data-invalid:data-selection-end:[&:not([data-hover])]:text-destructive-foreground data-invalid:data-selection-start:[&:not([data-hover])]:text-destructive-foreground data-selection-end:[&:not([data-hover])]:text-primary-foreground data-selection-start:[&:not([data-hover])]:text-primary-foreground relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-30 data-focus-visible:z-10 data-focus-visible:ring-2 data-focus-visible:ring-offset-2 data-focus-visible:outline-hidden data-invalid:bg-red-100 data-selected:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg data-unavailable:pointer-events-none data-unavailable:line-through data-unavailable:opacity-30', $.get(date).compare(now) === 0 && 'after:bg-primary data-selection-end:[&:not([data-hover])]:after:bg-background data-selection-start:[&:not([data-hover])]:after:bg-background after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full'));

																						$.component(node_22, () => DateRangePicker.Cell, ($$anchor, DateRangePicker_Cell) => {
																							DateRangePicker_Cell($$anchor, {
																								get date() {
																									return $.get(date);
																								},

																								get month() {
																									return $.get(month).value;
																								},

																								get class() {
																									return $.get($0);
																								},

																								children: ($$anchor, $$slotProps) => {
																									var fragment_22 = $.comment();
																									var node_23 = $.first_child(fragment_22);

																									{
																										let $0 = $.derived(() => cn('text-foreground ring-offset-background relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150', 'disabled:pointer-events-none data-outside-month:pointer-events-none', 'data-highlighted:bg-accent data-selected:bg-accent', 'data-selection-end:bg-primary data-selection-start:bg-primary', 'data-selection-end:text-primary-foreground data-selection-start:text-primary-foreground', 'data-highlighted:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg', 'focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'));

																										$.component(node_23, () => DateRangePicker.Day, ($$anchor, DateRangePicker_Day) => {
																											DateRangePicker_Day($$anchor, {
																												get class() {
																													return $.get($0);
																												},

																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_3 = $.text();

																													$.template_effect(() => $.set_text(text_3, $.get(date).day));
																													$.append($$anchor, text_3);
																												},
																												$$slots: { default: true }
																											});
																										});
																									}

																									$.append($$anchor, fragment_22);
																								},
																								$$slots: { default: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_21);
																				});

																				$.append($$anchor, fragment_20);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_19);
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									});

									$.reset(div_2);
									$.append($$anchor, fragment_8);
								};

								$.component(node_8, () => DateRangePicker.Calendar, ($$anchor, DateRangePicker_Calendar) => {
									DateRangePicker_Calendar($$anchor, { class: 'w-fit p-2', children, $$slots: { default: true } });
								});
							}

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
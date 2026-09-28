import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '../ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { cn } from '$lib/utils';
import { DatePicker } from 'bits-ui';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div class="bg-primary data-selected:bg-background absolute start-1/2 bottom-1 hidden size-[3px] -translate-x-1/2 rounded-full transition-all group-data-today:block"></div> `, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4"></div>`, 1);
var root_5 = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="flex"><div class="bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 pe-9 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50"><!></div> <!></div> <!></div>`);

export default function Input_41($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(undefined);
	let locale = useLocale();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DatePicker.Root, ($$anchor, DatePicker_Root) => {
		DatePicker_Root($$anchor, {
			get locale() {
				return locale.locale;
			},
			weekdayFormat: 'short',
			fixedWeeks: true,
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_5();
				var node_1 = $.child(div);

				Label(node_1, {
					class: 'text-foreground text-sm font-medium',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Date picker');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_1 = $.sibling(node_1, 2);
				var div_2 = $.child(div_1);
				var node_2 = $.child(div_2);

				{
					const children = ($$anchor, $$arg0) => {
						let segments = () => ($$arg0?.()).segments;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 19, segments, ({ part, value }, i) => part + i, ($$anchor, $$item, i, $$array) => {
							let part = () => $.get($$item).part;
							let value = () => $.get($$item).value;
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => DatePicker.Segment, ($$anchor, DatePicker_Segment) => {
								DatePicker_Segment($$anchor, {
									get part() {
										return part();
									},

									class: [
										'text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
										'data-[segment=literal]:text-muted-foreground/70 data-[segment=literal]:px-0'
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

							$.append($$anchor, fragment_2);
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_2, () => DatePicker.Input, ($$anchor, DatePicker_Input) => {
						DatePicker_Input($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.reset(div_2);

				var node_5 = $.sibling(div_2, 2);

				$.component(node_5, () => DatePicker.Trigger, ($$anchor, DatePicker_Trigger) => {
					DatePicker_Trigger($$anchor, {
						class: 'text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]',
						children: ($$anchor, $$slotProps) => {
							CalendarIcon($$anchor, { size: 16 });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var node_6 = $.sibling(div_1, 2);

				$.component(node_6, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
					DatePicker_Content($$anchor, {
						sideOffset: 6,
						class: 'border-input bg-background text-foreground z-50 rounded-lg border shadow-lg shadow-black/[.04] outline-hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							{
								const children = ($$anchor, $$arg0) => {
									let months = () => ($$arg0?.()).months;
									let weekdays = () => ($$arg0?.()).weekdays;
									var fragment_6 = root_4();
									var node_8 = $.first_child(fragment_6);

									$.component(node_8, () => DatePicker.Header, ($$anchor, DatePicker_Header) => {
										DatePicker_Header($$anchor, {
											class: 'flex w-full items-center gap-1 pb-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => DatePicker.PrevButton, ($$anchor, DatePicker_PrevButton) => {
													DatePicker_PrevButton($$anchor, {
														class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
														children: ($$anchor, $$slotProps) => {
															ChevronLeft($$anchor, { size: 16 });
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => DatePicker.Heading, ($$anchor, DatePicker_Heading) => {
													DatePicker_Heading($$anchor, { class: 'grow text-center text-sm font-medium' });
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => DatePicker.NextButton, ($$anchor, DatePicker_NextButton) => {
													DatePicker_NextButton($$anchor, {
														class: 'text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-shadow',
														children: ($$anchor, $$slotProps) => {
															ChevronRight($$anchor, { size: 16 });
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var div_3 = $.sibling(node_8, 2);

									$.each(div_3, 21, months, (month) => month.value, ($$anchor, month) => {
										var fragment_10 = $.comment();
										var node_12 = $.first_child(fragment_10);

										$.component(node_12, () => DatePicker.Grid, ($$anchor, DatePicker_Grid) => {
											DatePicker_Grid($$anchor, {
												class: 'w-fit border-collapse space-y-1 select-none',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_3();
													var node_13 = $.first_child(fragment_11);

													$.component(node_13, () => DatePicker.GridHead, ($$anchor, DatePicker_GridHead) => {
														DatePicker_GridHead($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_14 = $.first_child(fragment_12);

																$.component(node_14, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow) => {
																	DatePicker_GridRow($$anchor, {
																		class: 'flex w-full justify-between',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = $.comment();
																			var node_15 = $.first_child(fragment_13);

																			$.each(node_15, 16, weekdays, (day) => day, ($$anchor, day) => {
																				var fragment_14 = $.comment();
																				var node_16 = $.first_child(fragment_14);

																				$.component(node_16, () => DatePicker.HeadCell, ($$anchor, DatePicker_HeadCell) => {
																					DatePicker_HeadCell($$anchor, {
																						class: 'text-muted-foreground/80 size-9 rounded-lg p-0 text-xs font-medium',
																						children: ($$anchor, $$slotProps) => {
																							var div_4 = root_1();
																							var text_2 = $.only_child(div_4, true);

																							$.template_effect(($0) => $.set_text(text_2, $0), [() => day.slice(0, 2)]);
																							$.append($$anchor, div_4);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_14);
																			});

																			$.append($$anchor, fragment_13);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_13, 2);

													$.component(node_17, () => DatePicker.GridBody, ($$anchor, DatePicker_GridBody) => {
														DatePicker_GridBody($$anchor, {
															class: '[&_td]:px-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_18 = $.first_child(fragment_15);

																$.each(node_18, 16, () => $.get(month).weeks, (weekDates) => weekDates, ($$anchor, weekDates) => {
																	var fragment_16 = $.comment();
																	var node_19 = $.first_child(fragment_16);

																	$.component(node_19, () => DatePicker.GridRow, ($$anchor, DatePicker_GridRow_1) => {
																		DatePicker_GridRow_1($$anchor, {
																			class: 'flex w-full',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_17 = $.comment();
																				var node_20 = $.first_child(fragment_17);

																				$.each(node_20, 16, () => weekDates, (date) => date, ($$anchor, date) => {
																					var fragment_18 = $.comment();
																					var node_21 = $.first_child(fragment_18);

																					$.component(node_21, () => DatePicker.Cell, ($$anchor, DatePicker_Cell) => {
																						DatePicker_Cell($$anchor, {
																							get date() {
																								return date;
																							},

																							get month() {
																								return $.get(month).value;
																							},
																							class: 'relative size-10 p-0! text-center text-sm',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_19 = $.comment();
																								var node_22 = $.first_child(fragment_19);

																								{
																									let $0 = $.derived(() => cn('text-foreground ring-offset-background relative flex size-9 items-center justify-center rounded-lg border border-transparent p-0 text-sm font-normal whitespace-nowrap [transition-property:border-radius,box-shadow] duration-150', 'disabled:pointer-events-none data-outside-month:pointer-events-none', 'data-highlighted:bg-accent data-selected:bg-accent', 'data-selection-end:bg-primary data-selection-start:bg-primary', 'data-selection-end:text-primary-foreground data-selection-start:text-primary-foreground', 'data-highlighted:rounded-none data-selection-end:rounded-e-lg data-selection-start:rounded-s-lg', 'focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'));

																									$.component(node_22, () => DatePicker.Day, ($$anchor, DatePicker_Day) => {
																										DatePicker_Day($$anchor, {
																											get class() {
																												return $.get($0);
																											},

																											children: ($$anchor, $$slotProps) => {
																												var fragment_20 = root_2();
																												var text_3 = $.sibling($.first_child(fragment_20));

																												$.template_effect(() => $.set_text(text_3, ` ${date.day ?? ''}`));
																												$.append($$anchor, fragment_20);
																											},
																											$$slots: { default: true }
																										});
																									});
																								}

																								$.append($$anchor, fragment_19);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_18);
																				});

																				$.append($$anchor, fragment_17);
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

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									});

									$.reset(div_3);
									$.append($$anchor, fragment_6);
								};

								$.component(node_7, () => DatePicker.Calendar, ($$anchor, DatePicker_Calendar) => {
									DatePicker_Calendar($$anchor, { class: 'w-fit p-2', children, $$slots: { default: true } });
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
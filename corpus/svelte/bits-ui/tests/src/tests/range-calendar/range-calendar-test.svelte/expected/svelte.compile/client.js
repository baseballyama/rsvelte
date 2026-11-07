import 'svelte/internal/disclose-version';
import { RangeCalendar } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'placeholder', 'value']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div></div>`, 1);
var root_3 = $.from_html(`<main><div data-testid="start-value"> </div> <div data-testid="end-value"> </div> <!> <button>clear</button></main>`);

export default function Range_calendar_test($$anchor, $$props) {
	$.push($$props, true);

	let placeholder = $.prop($$props, 'placeholder', 7),
		value = $.prop($$props, 'value', 7),
		restProps = $.rest_props($$props, rest_excludes);

	function clear() {
		value({ start: undefined, end: undefined });
	}

	var main = root_3();
	var div = $.child(main);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var node = $.sibling(div_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let months = () => ($$arg0?.()).months;
			let weekdays = () => ($$arg0?.()).weekdays;
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => RangeCalendar.Header, ($$anchor, RangeCalendar_Header) => {
				RangeCalendar_Header($$anchor, {
					'data-testid': 'header',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => RangeCalendar.PrevButton, ($$anchor, RangeCalendar_PrevButton) => {
							RangeCalendar_PrevButton($$anchor, {
								'data-testid': 'prev-button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Prev');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => RangeCalendar.Heading, ($$anchor, RangeCalendar_Heading) => {
							RangeCalendar_Heading($$anchor, { 'data-testid': 'heading' });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => RangeCalendar.NextButton, ($$anchor, RangeCalendar_NextButton) => {
							RangeCalendar_NextButton($$anchor, {
								'data-testid': 'next-button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Next');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var div_2 = $.sibling(node_1, 2);

			$.each(div_2, 21, months, $.index, ($$anchor, month) => {
				const m = $.derived(() => $.get(month).value.month);
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => RangeCalendar.Grid, ($$anchor, RangeCalendar_Grid) => {
					RangeCalendar_Grid($$anchor, {
						get 'data-testid'() {
							return `grid-${$.get(m) ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => RangeCalendar.GridHead, ($$anchor, RangeCalendar_GridHead) => {
								RangeCalendar_GridHead($$anchor, {
									get 'data-testid'() {
										return `grid-head-${$.get(m) ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow) => {
											RangeCalendar_GridRow($$anchor, {
												get 'data-testid'() {
													return `grid-row-${$.get(m) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_8 = $.first_child(fragment_5);

													$.each(node_8, 17, weekdays, $.index, ($$anchor, day, i, $$array) => {
														var fragment_6 = $.comment();
														var node_9 = $.first_child(fragment_6);

														$.component(node_9, () => RangeCalendar.HeadCell, ($$anchor, RangeCalendar_HeadCell) => {
															RangeCalendar_HeadCell($$anchor, {
																get 'data-testid'() {
																	return `weekday-${$.get(m) ?? ''}-${i}`;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, $.get(day)));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_6, 2);

							$.component(node_10, () => RangeCalendar.GridBody, ($$anchor, RangeCalendar_GridBody) => {
								RangeCalendar_GridBody($$anchor, {
									get 'data-testid'() {
										return `grid-body-${$.get(m) ?? ''}`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_11 = $.first_child(fragment_8);

										$.each(node_11, 17, () => $.get(month).weeks, $.index, ($$anchor, weekDates, i, $$array_1) => {
											var fragment_9 = $.comment();
											var node_12 = $.first_child(fragment_9);

											$.component(node_12, () => RangeCalendar.GridRow, ($$anchor, RangeCalendar_GridRow_1) => {
												RangeCalendar_GridRow_1($$anchor, {
													get 'data-testid'() {
														return `grid-row-${$.get(m) ?? ''}-${i}`;
													},
													'data-week': true,
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = $.comment();
														var node_13 = $.first_child(fragment_10);

														$.each(node_13, 17, () => $.get(weekDates), $.index, ($$anchor, date, d) => {
															var fragment_11 = $.comment();
															var node_14 = $.first_child(fragment_11);

															$.component(node_14, () => RangeCalendar.Cell, ($$anchor, RangeCalendar_Cell) => {
																RangeCalendar_Cell($$anchor, {
																	get date() {
																		return $.get(date);
																	},

																	get month() {
																		return $.get(month).value;
																	},

																	get 'data-testid'() {
																		return `cell-${$.get(date).month ?? ''}-${d}`;
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = $.comment();
																		var node_15 = $.first_child(fragment_12);

																		$.component(node_15, () => RangeCalendar.Day, ($$anchor, RangeCalendar_Day) => {
																			RangeCalendar_Day($$anchor, {
																				get 'data-testid'() {
																					return `date-${$.get(date).month ?? ''}-${$.get(date).day ?? ''}`;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text();

																					$.template_effect(() => $.set_text(text_5, $.get(date).day));
																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														});

														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.reset(div_2);
			$.append($$anchor, fragment);
		};

		$.component(node, () => RangeCalendar.Root, ($$anchor, RangeCalendar_Root) => {
			RangeCalendar_Root($$anchor, $.spread_props(() => restProps, {
				'data-testid': 'calendar',
				get placeholder() {
					return placeholder();
				},

				set placeholder($$value) {
					placeholder($$value);
				},

				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},
				children,
				$$slots: { default: true }
			}));
		});
	}

	var button = $.sibling(node, 2);

	$.reset(main);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => String(value()?.start), () => String(value()?.end)]
	);

	$.delegated('click', button, clear);
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);
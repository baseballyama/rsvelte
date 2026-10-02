import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import CalendarDayButton from "$lib/registry/ui/range-calendar/range-calendar-day.svelte";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(` <!>`, 1);

export default function Calendar_custom_days($$anchor, $$props) {
	$.push($$props, true);

	const currentDate = new CalendarDate(2022, 1, 20);
	let date = $.state($.proxy({ start: currentDate, end: currentDate.add({ days: 20 }) }));

	Example($$anchor, {
		title: 'Custom Days',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-fit p-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'p-0',
								children: ($$anchor, $$slotProps) => {
									{
										const day = ($$anchor, $$arg0) => {
											let day = () => ($$arg0?.()).day;
											let outsideMonth = () => ($$arg0?.()).outsideMonth;
											const isWeekend = $.derived(() => day().toDate(getLocalTimeZone()).getDay() === 0 || day().toDate(getLocalTimeZone()).getDay() === 6);

											CalendarDayButton($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root_1();
													var text = $.first_child(fragment_5);
													var node_2 = $.sibling(text);

													{
														var consequent = ($$anchor) => {
															var span = root();
															var text_1 = $.only_child(span, true);

															$.template_effect(() => $.set_text(text_1, $.get(isWeekend) ? "$120" : "$100"));
															$.append($$anchor, span);
														};

														$.if(node_2, ($$render) => {
															if (!outsideMonth()) $$render(consequent);
														});
													}

													$.template_effect(() => $.set_text(text, `${day().day ?? ''} `));
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										};

										RangeCalendar($$anchor, {
											numberOfMonths: 1,
											captionLayout: 'dropdown',
											class: '[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]',
											get value() {
												return $.get(date);
											},

											set value($$value) {
												$.set(date, $$value, true);
											},
											day,
											$$slots: { day: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
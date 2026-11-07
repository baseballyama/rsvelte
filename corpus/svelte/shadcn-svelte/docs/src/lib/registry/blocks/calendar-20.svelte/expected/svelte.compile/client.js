import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="p-6"><!></div> <div class="inset-y-0 end-0 no-scrollbar flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-s md:border-t-0"><div class="grid gap-2"></div></div>`, 1);
var root_1 = $.from_html(`Your meeting is booked for <span class="font-medium"> </span> at <span class="font-medium"> </span>.`, 1);
var root_2 = $.from_html(`<div class="text-sm"><!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Calendar_20($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	let selectedTime = $.state("10:00");
	const bookedDates = Array.from({ length: 3 }, (_, i) => new CalendarDate(2025, 6, 17 + i));

	const timeSlots = Array.from({ length: 37 }, (_, i) => {
		const totalMinutes = i * 15;
		const hour = Math.floor(totalMinutes / 60) + 9;
		const minute = totalMinutes % 60;

		return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'gap-0 p-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'relative p-0 md:pe-48',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var div = $.first_child(fragment_2);
							var node_2 = $.child(div);

							Calendar(node_2, {
								type: 'single',
								isDateUnavailable: (date) => bookedDates.some((d) => d.compare(date) === 0),
								class: 'bg-transparent p-0 [--cell-size:--spacing(10)] data-unavailable:line-through data-unavailable:opacity-100 md:[--cell-size:--spacing(12)] [&_[data-outside-month]]:hidden',
								weekdayFormat: 'short',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var div_2 = $.child(div_1);

							$.each(div_2, 20, () => timeSlots, (time) => time, ($$anchor, time) => {
								{
									let $0 = $.derived(() => $.get(selectedTime) === time ? "default" : "outline");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										onclick: () => $.set(selectedTime, time, true),
										class: 'w-full shadow-none',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, time));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								}
							});

							$.reset(div_2);
							$.reset(div_1);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex flex-col gap-4 border-t px-6 !py-5 md:flex-row',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var div_3 = $.first_child(fragment_5);
							var node_4 = $.child(div_3);

							{
								var consequent = ($$anchor) => {
									var fragment_6 = root_1();
									var span = $.sibling($.first_child(fragment_6));
									var text_1 = $.only_child(span, true);
									var span_1 = $.sibling(span, 2);
									var text_2 = $.only_child(span_1, true);

									$.next();

									$.template_effect(
										($0) => {
											$.set_text(text_1, $0);
											$.set_text(text_2, $.get(selectedTime));
										},
										[
											() => $.get(value).toDate(getLocalTimeZone()).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })
										]
									);

									$.append($$anchor, fragment_6);
								};

								var alternate = ($$anchor) => {
									var text_3 = $.text('Select a date and time for your meeting.');

									$.append($$anchor, text_3);
								};

								$.if(node_4, ($$render) => {
									if ($.get(value) && $.get(selectedTime)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(div_3);

							var node_5 = $.sibling(div_3, 2);

							{
								let $0 = $.derived(() => !$.get(value) || !$.get(selectedTime));

								Button(node_5, {
									get disabled() {
										return $.get($0);
									},
									class: 'w-full md:ms-auto md:w-auto',
									variant: 'outline',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Continue');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
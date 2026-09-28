import * as $ from 'svelte/internal/server';
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Calendar_booked_dates($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currentDate = today(getLocalTimeZone());
		const bookedDates = Array.from({ length: 15 }, (_, i) => new CalendarDate(currentDate.year, currentDate.month, 12 + i));

		Example($$renderer, {
			title: 'Booked Dates',
			children: ($$renderer) => {
				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'mx-auto w-fit p-0',
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'p-0',
									children: ($$renderer) => {
										Calendar($$renderer, {
											type: 'single',
											isDateUnavailable: (d) => bookedDates.some((bd) => bd.compare(d) === 0)
										});
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
	});
}
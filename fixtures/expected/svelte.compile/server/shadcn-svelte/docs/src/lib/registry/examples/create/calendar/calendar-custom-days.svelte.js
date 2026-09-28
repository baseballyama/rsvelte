import * as $ from 'svelte/internal/server';
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import CalendarDayButton from "$lib/registry/ui/range-calendar/range-calendar-day.svelte";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Calendar_custom_days($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currentDate = new CalendarDate(2022, 1, 20);
		let date = { start: currentDate, end: currentDate.add({ days: 20 }) };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Custom Days',
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
											{
												function day($$renderer, { day, outsideMonth }) {
													const isWeekend = day.toDate(getLocalTimeZone()).getDay() === 0 || day.toDate(getLocalTimeZone()).getDay() === 6;

													CalendarDayButton($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(day.day)} `);

															if (!outsideMonth) {
																$$renderer.push(`<!--[0--><span>${$.escape(isWeekend ? "$120" : "$100")}</span>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});
												}

												RangeCalendar($$renderer, {
													numberOfMonths: 1,
													captionLayout: 'dropdown',
													class: '[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]',
													get value() {
														return date;
													},

													set value($$value) {
														date = $$value;
														$$settled = false;
													},
													day,
													$$slots: { day: true }
												});
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
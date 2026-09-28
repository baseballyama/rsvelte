import * as $ from 'svelte/internal/server';
import { CalendarDate, isWeekend } from "@internationalized/date";
import RangeCalendarDay from "$lib/registry/ui/range-calendar/range-calendar-day.svelte";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

export default function Calendar_21($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 6, 12),
			end: new CalendarDate(2025, 6, 17)
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function day($$renderer, { day, outsideMonth }) {
					const dayIsWeekend = isWeekend(day, "en-US");

					RangeCalendarDay($$renderer, {
						class: 'flex flex-col items-center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(day.day)} `);

							if (!outsideMonth) {
								$$renderer.push(`<!--[0--><span>${$.escape(dayIsWeekend ? "$220" : "$100")}</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				}

				RangeCalendar($$renderer, {
					class: 'rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]',
					monthFormat: 'long',
					captionLayout: 'dropdown',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					day,
					$$slots: { day: true }
				});
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
import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_14($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new CalendarDate(2025, 6, 12);
		const bookedDates = Array.from({ length: 12 }, (_, i) => new CalendarDate(2025, 6, 15 + i));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Calendar($$renderer, {
				type: 'single',
				class: 'rounded-lg border shadow-sm',
				isDateUnavailable: (date) => bookedDates.some((d) => d.compare(date) === 0),
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
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
import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

export default function Calendar_04($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 6, 9),
			end: new CalendarDate(2025, 6, 26)
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			RangeCalendar($$renderer, {
				class: 'rounded-lg border shadow-sm',
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
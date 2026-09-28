import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

export default function Calendar_07($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 6, 18),
			end: new CalendarDate(2025, 7, 7)
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex min-w-0 flex-col gap-2">`);

			RangeCalendar($$renderer, {
				minDays: 2,
				maxDays: 20,
				numberOfMonths: 2,
				class: 'rounded-lg border shadow-sm',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="text-center text-xs text-muted-foreground">Your stay must be between 2 and 20 nights</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
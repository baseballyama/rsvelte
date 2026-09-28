import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";

export default function Calendar_11($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 6, 17),
			end: new CalendarDate(2025, 6, 20)
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex min-w-0 flex-col gap-2">`);

			RangeCalendar($$renderer, {
				numberOfMonths: 2,
				minValue: new CalendarDate(2025, 6, 1),
				maxValue: new CalendarDate(2025, 7, 31),
				class: 'rounded-lg border shadow-sm',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="text-center text-xs text-muted-foreground">We are open in June and July only.</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
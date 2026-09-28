import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_18($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new CalendarDate(2025, 6, 12);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Calendar($$renderer, {
				type: 'single',
				class: 'rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]',
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
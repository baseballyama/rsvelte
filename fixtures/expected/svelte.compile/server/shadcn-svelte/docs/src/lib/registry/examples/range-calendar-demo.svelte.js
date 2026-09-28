import * as $ from 'svelte/internal/server';
import { getLocalTimeZone, today } from "@internationalized/date";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";

export default function Range_calendar_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const start = today(getLocalTimeZone());
		const end = start.add({ days: 7 });
		let value = { start, end };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			RangeCalendar($$renderer, {
				class: 'rounded-md border',
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